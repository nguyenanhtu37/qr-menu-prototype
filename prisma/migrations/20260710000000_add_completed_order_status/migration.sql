-- Add completed status so a table can be cleared without deleting order history.
ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';
