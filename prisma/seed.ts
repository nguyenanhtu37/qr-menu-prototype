import { MenuCategory, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    name: `Bàn ${index + 1}`,
  }));

  const menuItems = [
    {
      id: 1,
      name: "Ba chỉ bò Mỹ",
      description:
        "Lát ba chỉ bò Mỹ mềm béo, nướng nhanh trên vỉ than, ăn kèm sốt mè rang.",
      imageUrl:
        "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=900&q=80",
      price: 129000,
      category: MenuCategory.FOOD,
    },
    {
      id: 2,
      name: "Sườn heo sốt cay",
      description:
        "Sườn heo ướp sốt gochujang cay ngọt, nướng cháy cạnh thơm đậm vị.",
      imageUrl:
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
      price: 119000,
      category: MenuCategory.FOOD,
    },
    {
      id: 3,
      name: "Gầu bò",
      description:
        "Gầu bò giòn nhẹ, xen mỡ vừa phải, hợp với sốt chấm cay và kimchi.",
      imageUrl:
        "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80",
      price: 99000,
      category: MenuCategory.FOOD,
    },
    {
      id: 4,
      name: "Bò cuộn nấm kim châm",
      description:
        "Bò Mỹ thái mỏng cuộn nấm kim châm, vị ngọt thanh và mọng nước.",
      imageUrl:
        "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=900&q=80",
      price: 109000,
      category: MenuCategory.FOOD,
    },
    {
      id: 5,
      name: "Mì lạnh Hàn Quốc",
      description:
        "Mì kiều mạch lạnh, nước dùng thanh mát, topping trứng và rau củ.",
      imageUrl:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
      price: 79000,
      category: MenuCategory.FOOD,
    },
    {
      id: 6,
      name: "Cơm trộn Bulgogi",
      description:
        "Cơm nóng trộn bò bulgogi, rau củ, trứng lòng đào và sốt cay Hàn.",
      imageUrl:
        "https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=900&q=80",
      price: 89000,
      category: MenuCategory.FOOD,
    },
    {
      id: 7,
      name: "Lẩu kimchi hải sản",
      description:
        "Nồi lẩu kimchi chua cay với tôm, mực, nghêu và rau nấm tươi.",
      imageUrl:
        "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=900&q=80",
      price: 189000,
      category: MenuCategory.FOOD,
    },
    {
      id: 8,
      name: "Mực sốt gochujang",
      description:
        "Mực tươi xào sốt gochujang cay thơm, phủ mè rang và hành lá.",
      imageUrl:
        "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80",
      price: 139000,
      category: MenuCategory.FOOD,
    },
    {
      id: 9,
      name: "Kimchi",
      description:
        "Kimchi cải thảo lên men vị chua cay, dùng kèm món nướng rất hợp.",
      imageUrl:
        "https://images.unsplash.com/photo-1583224964978-2257b960c3d3?auto=format&fit=crop&w=900&q=80",
      price: 29000,
      category: MenuCategory.SIDE,
    },
    {
      id: 10,
      name: "Salad rong biển",
      description:
        "Rong biển trộn mè, dưa leo và sốt chua ngọt, nhẹ bụng giữa bữa.",
      imageUrl:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
      price: 39000,
      category: MenuCategory.SIDE,
    },
    {
      id: 11,
      name: "Khoai tây chiên",
      description:
        "Khoai tây chiên giòn, dùng cùng tương cà và sốt mayonnaise.",
      imageUrl:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
      price: 45000,
      category: MenuCategory.SIDE,
    },
    {
      id: 12,
      name: "Trứng hấp Hàn Quốc",
      description:
        "Trứng hấp mềm xốp trong niêu nóng, vị béo nhẹ và thơm hành lá.",
      imageUrl:
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
      price: 49000,
      category: MenuCategory.SIDE,
    },
    {
      id: 13,
      name: "Coca Cola",
      description: "Lon Coca Cola 330ml, dùng lạnh.",
      imageUrl:
        "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=900&q=80",
      price: 25000,
      category: MenuCategory.DRINK,
    },
    {
      id: 14,
      name: "Sprite",
      description: "Lon Sprite 330ml, vị chanh tươi mát.",
      imageUrl:
        "https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=900&q=80",
      price: 25000,
      category: MenuCategory.DRINK,
    },
    {
      id: 15,
      name: "Trà đào",
      description: "Trà đào cam sả, vị ngọt dịu và thơm nhẹ.",
      imageUrl:
        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80",
      price: 39000,
      category: MenuCategory.DRINK,
    },
    {
      id: 16,
      name: "Trà chanh",
      description: "Trà chanh tươi, ít ngọt, hợp để uống kèm món cay.",
      imageUrl:
        "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=900&q=80",
      price: 35000,
      category: MenuCategory.DRINK,
    },
    {
      id: 17,
      name: "Nước suối",
      description: "Chai nước suối 500ml.",
      imageUrl:
        "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80",
      price: 15000,
      category: MenuCategory.DRINK,
    },
    {
      id: 18,
      name: "Soju đào",
      description: "Soju vị đào 360ml, phục vụ nguyên chai.",
      imageUrl:
        "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=900&q=80",
      price: 99000,
      category: MenuCategory.DRINK,
    },
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: { id: table.id },
      update: { name: table.name },
      create: table,
    });
  }

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: { ...item, isAvailable: true },
      create: { ...item, isAvailable: true },
    });
  }

  await prisma.$executeRawUnsafe(
    "SELECT setval(pg_get_serial_sequence('tables', 'id'), (SELECT MAX(id) FROM tables));",
  );
  await prisma.$executeRawUnsafe(
    "SELECT setval(pg_get_serial_sequence('menu_items', 'id'), (SELECT MAX(id) FROM menu_items));",
  );

  console.log("Seed completed successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
