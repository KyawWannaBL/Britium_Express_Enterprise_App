import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roleCodes = [
    ["rider", "Rider"],
    ["driver", "Driver"],
    ["warehouse_manager", "Warehouse Manager"],
    ["receiving_clerk", "Receiving Clerk"],
    ["sorting_staff", "Sorting Staff"],
    ["inventory_controller", "Inventory Controller"],
    ["dispatch_coordinator", "Dispatch Coordinator"],
    ["qa_officer", "QA Officer"],
    ["returns_officer", "Returns Officer"],
    ["scanner_operator", "Scanner Operator"],
    ["data_entry_clerk", "Data Entry Clerk"],
    ["senior_data_entry_reviewer", "Senior Data Entry Reviewer"],
    ["data_entry_supervisor", "Data Entry Supervisor"],
    ["operations_supervisor", "Operations Supervisor"],
    ["dispatch_supervisor", "Dispatch Supervisor"],
    ["fleet_supervisor", "Fleet Supervisor"],
    ["planning_supervisor", "Planning Supervisor"],
    ["branch_supervisor", "Branch Supervisor"],
    ["senior_operations_manager", "Senior Operations Manager"],
    ["hr_officer", "HR Officer"],
    ["hr_manager", "HR Manager"],
    ["admin_manager", "Admin Manager"],
    ["people_ops_lead", "People Ops Lead"],
    ["super_admin", "Super Admin"],
  ];

  for (const [code, name] of roleCodes) {
    await prisma.role.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  const ygn = await prisma.branch.upsert({
    where: { code: "YGN-HQ" },
    update: {},
    create: {
      code: "YGN-HQ",
      name: "Yangon Headquarters",
      city: "Yangon",
      region: "Yangon",
    },
  });

  const mdy = await prisma.branch.upsert({
    where: { code: "MDY-HUB" },
    update: {},
    create: {
      code: "MDY-HUB",
      name: "Mandalay Hub",
      city: "Mandalay",
      region: "Mandalay",
    },
  });

  await prisma.warehouseLocation.upsert({
    where: { code: "BIN-A12" },
    update: {},
    create: {
      code: "BIN-A12",
      locationType: "INBOUND_BIN",
      branchId: ygn.id,
      capacity: 100,
      currentLoad: 12,
    },
  });

  await prisma.warehouseLocation.upsert({
    where: { code: "STAGE-R1" },
    update: {},
    create: {
      code: "STAGE-R1",
      locationType: "STAGING_LANE",
      branchId: ygn.id,
      capacity: 50,
      currentLoad: 8,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "superadmin@britium.local" },
    update: {},
    create: {
      email: "superadmin@britium.local",
      fullName: "System Super Admin",
      active: true,
    },
  });

  const hrUser = await prisma.user.upsert({
    where: { email: "hr.manager@britium.local" },
    update: {},
    create: {
      email: "hr.manager@britium.local",
      fullName: "HR Manager",
      active: true,
    },
  });

  const opsUser = await prisma.user.upsert({
    where: { email: "ops.supervisor@britium.local" },
    update: {},
    create: {
      email: "ops.supervisor@britium.local",
      fullName: "Operations Supervisor",
      active: true,
    },
  });

  const riderUser = await prisma.user.upsert({
    where: { email: "rider.01@britium.local" },
    update: {},
    create: {
      email: "rider.01@britium.local",
      fullName: "Rider One",
      active: true,
    },
  });

  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { code: "super_admin" } });
  const hrRole = await prisma.role.findUniqueOrThrow({ where: { code: "hr_manager" } });
  const opsRole = await prisma.role.findUniqueOrThrow({ where: { code: "operations_supervisor" } });
  const riderRole = await prisma.role.findUniqueOrThrow({ where: { code: "rider" } });

  const bindings = [
    [adminUser.id, superAdminRole.id, ygn.id],
    [hrUser.id, hrRole.id, ygn.id],
    [opsUser.id, opsRole.id, ygn.id],
    [riderUser.id, riderRole.id, ygn.id],
  ];

  for (const [userId, roleId, branchId] of bindings) {
    const existing = await prisma.roleBinding.findFirst({
      where: { userId, roleId, branchId },
    });

    if (!existing) {
      await prisma.roleBinding.create({
        data: { userId, roleId, branchId },
      });
    }
  }

  const employeeRecords = [
    [adminUser, "EMP-0001", "Administration", "System Administrator"],
    [hrUser, "EMP-0002", "People", "HR Manager"],
    [opsUser, "EMP-0003", "Operations", "Operations Supervisor"],
    [riderUser, "EMP-0004", "Operations", "Delivery Rider"],
  ] as const;

  for (const [user, employeeCode, department, title] of employeeRecords) {
    await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        employeeCode,
        department,
        title,
        branchId: ygn.id,
        joinDate: new Date("2025-01-01T00:00:00.000Z"),
        employmentStatus: "ACTIVE",
      },
    });
  }

  const manifest = await prisma.manifest.upsert({
    where: { manifestNo: "MNF-240401-01" },
    update: {},
    create: {
      manifestNo: "MNF-240401-01",
      destinationBranchId: mdy.id,
      bagCode: "BG-1001",
      sealCode: "SEAL-1001",
      status: "CREATED",
    },
  });

  const shipment1 = await prisma.shipment.upsert({
    where: { awb: "BEX-240401001" },
    update: {},
    create: {
      awb: "BEX-240401001",
      senderName: "Britium Ventures",
      senderPhone: "0911111111",
      receiverName: "Daw Ei Ei",
      receiverPhone: "0999990001",
      receiverAddress: "Sanchaung Township",
      township: "Sanchaung",
      city: "Yangon",
      zoneCode: "YGN-CENTRAL",
      codAmount: 35000,
      serviceType: "same_day",
      status: "ASSIGNED",
      branchId: ygn.id,
      manifestId: manifest.id,
    },
  });

  const shipment2 = await prisma.shipment.upsert({
    where: { awb: "BEX-240401002" },
    update: {},
    create: {
      awb: "BEX-240401002",
      senderName: "City Fresh",
      senderPhone: "0922222222",
      receiverName: "Ko Thant Zin",
      receiverPhone: "0999990002",
      receiverAddress: "Chanmyathazi Township",
      township: "Chanmyathazi",
      city: "Mandalay",
      zoneCode: "MDY-CENTRAL",
      codAmount: 0,
      serviceType: "next_day",
      status: "IN_TRANSIT",
      branchId: ygn.id,
      manifestId: manifest.id,
    },
  });

  const shipment3 = await prisma.shipment.upsert({
    where: { awb: "BEX-240401003" },
    update: {},
    create: {
      awb: "BEX-240401003",
      senderName: "Golden Shop",
      senderPhone: "0933333333",
      receiverName: "Ko Yadanar Htun",
      receiverPhone: "0999990003",
      receiverAddress: "North Okkalapa Township",
      township: "North Okkalapa",
      city: "Yangon",
      zoneCode: "YGN-NORTH",
      codAmount: 18000,
      serviceType: "standard",
      status: "FAILED",
      branchId: ygn.id,
    },
  });

  await prisma.manifest.update({
    where: { id: manifest.id },
    data: {
      totalShipments: 2,
      totalCod: 35000,
    },
  });

  const tasks = [
    [shipment1.id, "rider-driver", "DELIVERY", "ASSIGNED", riderUser.id],
    [shipment2.id, "warehouse", "TRANSFER_MONITOR", "ASSIGNED", opsUser.id],
    [shipment3.id, "supervisor", "FAILED_DELIVERY_REVIEW", "UNDER_REVIEW", opsUser.id],
  ] as const;

  for (const [shipmentId, portal, taskType, status, assignedToId] of tasks) {
    const existing = await prisma.task.findFirst({
      where: { shipmentId, portal, taskType, assignedToId },
    });

    if (!existing) {
      await prisma.task.create({
        data: {
          shipmentId,
          portal,
          taskType,
          status,
          assignedToId,
          createdById: adminUser.id,
          branchId: ygn.id,
          payload: {},
        },
      });
    }
  }

  await prisma.transfer.upsert({
    where: { transferNo: "TR-240401-01" },
    update: {},
    create: {
      transferNo: "TR-240401-01",
      fromBranchId: ygn.id,
      toBranchId: mdy.id,
      shipmentCount: 2,
      totalCod: 35000,
      status: "DISPATCHED",
      departureAt: new Date(),
    },
  });

  await prisma.dataEntryRecord.upsert({
    where: { referenceNo: "DER-240401-01" },
    update: {},
    create: {
      referenceNo: "DER-240401-01",
      recordType: "NRC_CAPTURE",
      branchId: ygn.id,
      status: "SUBMITTED",
      createdByUserId: adminUser.id,
      reviewerUserId: hrUser.id,
      payload: {
        applicantName: "Aung Aung",
        source: "manual-entry",
      },
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
