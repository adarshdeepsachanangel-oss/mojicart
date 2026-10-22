import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();
    const {
      addressId,
      customAddress,
      paymentMethod = "COD",
      couponCode,
      items: directItems,
    } = body;

    let customerId = user?.id;

    // Resolve address
    let deliveryAddressSnapshot = "";
    if (addressId && user) {
      const address = await prisma.address.findUnique({
        where: { id: addressId, userId: user.id },
      });
      if (address) {
        deliveryAddressSnapshot = JSON.stringify({
          fullName: address.fullName,
          phone: address.phone,
          pincode: address.pincode,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          addressType: address.addressType,
        });
      }
    }

    if (!deliveryAddressSnapshot && customAddress) {
      if (!customAddress.fullName || !customAddress.phone || !customAddress.pincode || !customAddress.addressLine1 || !customAddress.city || !customAddress.state) {
        return NextResponse.json(
          { error: "Complete delivery address with pincode and phone is required" },
          { status: 400 }
        );
      }
      deliveryAddressSnapshot = JSON.stringify(customAddress);

      // If user is logged in, optionally save address for future
      if (user && customAddress.saveAddress) {
        await prisma.address.create({
          data: {
            userId: user.id,
            fullName: customAddress.fullName,
            phone: customAddress.phone,
            pincode: customAddress.pincode,
            addressLine1: customAddress.addressLine1,
            addressLine2: customAddress.addressLine2 || null,
            city: customAddress.city,
            state: customAddress.state,
            addressType: customAddress.addressType || "HOME",
            isDefault: false,
          },
        });
      }
    }

    if (!deliveryAddressSnapshot) {
      return NextResponse.json({ error: "Valid delivery address is required" }, { status: 400 });
    }

    // Resolve items from cart if not direct buy
    let rawItems = directItems;
    if (!rawItems || rawItems.length === 0) {
      if (!user) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      }
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: user.id },
        include: { product: true, variant: true },
      });
      if (cartItems.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      }
      rawItems = cartItems.map((c) => ({
        productId: c.productId,
        variantId: c.variantId,
        quantity: c.quantity,
      }));
    }

    // If user is not logged in and placed guest order, create or link a guest customer record
    if (!customerId) {
      const parsedAddr = JSON.parse(deliveryAddressSnapshot);
      const guestEmail = parsedAddr.email || `guest_${Date.now()}@mojicart.in`;
      let guestUser = await prisma.user.findFirst({ where: { email: guestEmail } });
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            name: parsedAddr.fullName || "Guest Customer",
            email: guestEmail,
            phone: parsedAddr.phone,
            passwordHash: "GUEST_CHECKOUT",
            role: "CUSTOMER",
            status: "ACTIVE",
          },
        });
      }
      customerId = guestUser.id;
    }

    // Server-side validation of stock and prices in database transaction
    const orderResult = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      let totalTax = 0;
      const orderItemsData: any[] = [];

      for (const item of rawItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { seller: true },
        });

        if (!product || product.status !== "APPROVED") {
          throw new Error(`Product ${product?.title || item.productId} is not available.`);
        }

        let variant = null;
        let unitPrice = product.basePrice;
        let unitMrp = product.mrp;
        let availableStock = product.stock;

        if (item.variantId) {
          variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });
          if (!variant) {
            throw new Error(`Selected variant not found for ${product.title}`);
          }
          unitPrice = variant.price;
          unitMrp = variant.mrp;
          availableStock = variant.stock;
        }

        if (availableStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.title}". Requested: ${item.quantity}, Available: ${availableStock}`
          );
        }

        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        // Calculate tax component based on product tax rate (GST)
        const lineTax = (lineTotal * product.taxRate) / (100 + product.taxRate);
        totalTax += lineTax;

        // Multi-vendor commission split
        const commissionPercent = product.seller.commissionRate || 10.0;
        const commissionAmount = (lineTotal * commissionPercent) / 100;
        const sellerPayout = lineTotal - commissionAmount;

        orderItemsData.push({
          sellerId: product.sellerId,
          productId: product.id,
          variantId: variant ? variant.id : null,
          title: variant ? `${product.title} (${variant.title})` : product.title,
          price: unitPrice,
          mrp: unitMrp,
          quantity: item.quantity,
          total: lineTotal,
          commissionAmount: Math.round(commissionAmount * 100) / 100,
          sellerPayout: Math.round(sellerPayout * 100) / 100,
          status: "CONFIRMED",
        });

        // Atomic inventory decrement & stock movement
        if (variant) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: { decrement: item.quantity },
            totalSold: { increment: item.quantity },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            variantId: variant ? variant.id : null,
            changeQty: -item.quantity,
            reason: "SALE",
            referenceType: "ORDER",
          },
        });
      }

      // Shipping calculation
      const freeShippingThreshold = 499.0;
      const shippingFee = subtotal >= freeShippingThreshold ? 0.0 : 49.0;

      // Coupon discount calculation
      let couponDiscount = 0;
      let validCouponCode = null;

      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase().trim() },
        });

        if (coupon && coupon.isActive && coupon.endDate >= new Date() && subtotal >= coupon.minOrderValue) {
          validCouponCode = coupon.code;
          if (coupon.discountType === "PERCENTAGE") {
            couponDiscount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
              couponDiscount = coupon.maxDiscount;
            }
          } else {
            couponDiscount = coupon.discountValue;
          }
          couponDiscount = Math.min(couponDiscount, subtotal);

          // Increment coupon usage
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { increment: 1 } },
          });
        }
      }

      const totalAmount = Math.max(0, subtotal - couponDiscount + shippingFee);

      // Unique Order Number
      const orderNumber = `MOJI-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      // Estimated Delivery: 3 to 5 business days
      const estDelivery = new Date();
      estDelivery.setDate(estDelivery.getDate() + 4);

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          totalAmount: Math.round(totalAmount * 100) / 100,
          subtotal: Math.round(subtotal * 100) / 100,
          discountAmount: Math.round(couponDiscount * 100) / 100,
          couponCode: validCouponCode,
          couponDiscount: Math.round(couponDiscount * 100) / 100,
          shippingFee,
          taxAmount: Math.round(totalTax * 100) / 100,
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID", // In sandbox mock, simulate instant online payment or pending COD
          orderStatus: "CONFIRMED",
          deliveryAddress: deliveryAddressSnapshot,
          shippingCarrier: "Delhivery Express",
          trackingNumber: `DELH${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          estimatedDeliveryDate: estDelivery,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: [
              {
                fromStatus: "PENDING",
                toStatus: "CONFIRMED",
                comment: paymentMethod === "COD" ? "Order placed via Cash on Delivery" : "Order paid via Razorpay",
              },
            ],
          },
          payments: paymentMethod !== "COD"
            ? {
                create: [
                  {
                    transactionId: `pay_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    provider: paymentMethod,
                    amount: totalAmount,
                    status: "PAID",
                  },
                ],
              }
            : undefined,
        },
        include: {
          items: true,
        },
      });

      // Clear customer's cart
      if (user) {
        await tx.cartItem.deleteMany({
          where: { userId: user.id },
        });
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: orderResult.id,
        orderNumber: orderResult.orderNumber,
        totalAmount: orderResult.totalAmount,
        paymentMethod: orderResult.paymentMethod,
        paymentStatus: orderResult.paymentStatus,
        orderStatus: orderResult.orderStatus,
        trackingNumber: orderResult.trackingNumber,
        estimatedDeliveryDate: orderResult.estimatedDeliveryDate,
        itemsCount: orderResult.items.length,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order" },
      { status: 400 }
    );
  }
}
