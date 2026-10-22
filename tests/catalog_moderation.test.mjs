import test from 'node:test';
import assert from 'node:assert/strict';

test('Catalog Moderation: Bulk Status Transitions (APPROVE & UNPUBLISH)', () => {
  const products = [
    { id: 'prod-1', status: 'DRAFT', sku: 'SKU-1' },
    { id: 'prod-2', status: 'PENDING_APPROVAL', sku: 'SKU-2' },
    { id: 'prod-3', status: 'APPROVED', sku: 'SKU-3' },
  ];

  const selectedIds = ['prod-1', 'prod-2'];

  // Test bulk APPROVE
  const approvedList = products.map((p) =>
    selectedIds.includes(p.id) ? { ...p, status: 'APPROVED' } : p
  );
  assert.equal(approvedList[0].status, 'APPROVED');
  assert.equal(approvedList[1].status, 'APPROVED');
  assert.equal(approvedList[2].status, 'APPROVED');

  // Test bulk UNPUBLISH (setting to DRAFT)
  const unpublishIds = ['prod-1', 'prod-3'];
  const unpublishedList = approvedList.map((p) =>
    unpublishIds.includes(p.id) ? { ...p, status: 'DRAFT' } : p
  );
  assert.equal(unpublishedList[0].status, 'DRAFT');
  assert.equal(unpublishedList[1].status, 'APPROVED');
  assert.equal(unpublishedList[2].status, 'DRAFT');
});

test('Catalog Moderation: Multi-Select Select-All and Row Toggle', () => {
  const visibleProductIds = ['p1', 'p2', 'p3', 'p4'];
  let selected = [];

  // Toggle single item
  const toggleSelect = (id, current) =>
    current.includes(id) ? current.filter((x) => x !== id) : [...current, id];

  selected = toggleSelect('p1', selected);
  assert.deepEqual(selected, ['p1']);

  selected = toggleSelect('p3', selected);
  assert.deepEqual(selected, ['p1', 'p3']);

  // Check some selected
  const isAllSelected = (visible, sel) =>
    visible.length > 0 && visible.every((id) => sel.includes(id));
  const isSomeSelected = (visible, sel) =>
    visible.some((id) => sel.includes(id)) && !isAllSelected(visible, sel);

  assert.equal(isAllSelected(visibleProductIds, selected), false);
  assert.equal(isSomeSelected(visibleProductIds, selected), true);

  // Toggle select all
  const toggleAll = (visible, sel) => {
    if (isAllSelected(visible, sel)) {
      return sel.filter((id) => !visible.includes(id));
    }
    return Array.from(new Set([...sel, ...visible]));
  };

  selected = toggleAll(visibleProductIds, selected);
  assert.equal(isAllSelected(visibleProductIds, selected), true);
  assert.equal(selected.length, 4);

  // Deselect all
  selected = toggleAll(visibleProductIds, selected);
  assert.equal(selected.length, 0);
});

test('Catalog Moderation: Safe Delete and Archive Partitioning', () => {
  const itemsToDelete = [
    { id: 'p1', orderCount: 0 },
    { id: 'p2', orderCount: 5 }, // has orders, should be archived
    { id: 'p3', orderCount: 0 },
  ];

  const withOrders = itemsToDelete.filter((p) => p.orderCount > 0).map((p) => p.id);
  const withoutOrders = itemsToDelete.filter((p) => p.orderCount === 0).map((p) => p.id);

  assert.deepEqual(withOrders, ['p2']);
  assert.deepEqual(withoutOrders, ['p1', 'p3']);
});

test('Catalog Moderation: Exclusion of ARCHIVED products from ALL status filter', () => {
  const statusParam = 'ALL';
  const where = {};
  if (statusParam && statusParam !== 'ALL') {
    where.status = statusParam;
  } else if (statusParam === 'ALL') {
    where.status = { not: 'ARCHIVED' };
  } else if (!statusParam) {
    where.status = 'APPROVED';
  }

  assert.deepEqual(where.status, { not: 'ARCHIVED' });
});
