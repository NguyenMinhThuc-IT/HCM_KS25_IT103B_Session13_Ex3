const passengersBaggageRegistry = [
  {
    ticketId: "TKT_001",
    passengerName: "Nguyen Van An",
    classTier: "ECONOMY",
    membershipTier: "TITAN", // Duoc tang them 10kg mien cuoc
    bags: [
      { bagId: "BAG_01", weightKg: 18, isBulky: false, isPet: false },
      { bagId: "BAG_02", weightKg: 12, isBulky: true, isPet: false } // Kien cong kenh
    ]
  },
  {
    ticketId: "TKT_002",
    passengerName: "Tran Thi Mai",
    classTier: "BUSINESS",
    membershipTier: "GOLD", // Duoc tang them 10kg mien cuoc
    bags: [
      { bagId: "BAG_03", weightKg: 25, isBulky: false, isPet: true }, // Thu cung
      { bagId: "BAG_04", weightKg: 15, isBulky: false, isPet: false }
    ]
  },
  {
    ticketId: "TKT_003",
    passengerName: "Le Van Binh",
    classTier: "ECONOMY",
    membershipTier: "NONE",
    bags: [
      { bagId: "BAG_05", weightKg: 22, isBulky: false, isPet: false }
    ]
  }
];

// 2. HAM TINH TOAN CHI TIET PHU THU HANH LY (BUSINESS LOGIC)
const calculateBaggageSurcharge = (passengerRecord) => {
  if (!passengerRecord || typeof passengerRecord !== "object") {
    return { success: false, message: "Du lieu ve khong hop le." };
  }

  const { classTier, membershipTier, bags } = passengerRecord;

  // 1. Xac dinh han muc mien cuoc co so theo hang ve
  let baseFreeAllowance = classTier === "BUSINESS" ? 30 : 20;

  // 2. Cong them uu dai hoi vien (Titan tro len duoc tang them 10kg)
  let membershipBonus = 0;
  const cleanMember = membershipTier ? membershipTier.trim().toUpperCase() : "NONE";
  if (cleanMember === "TITAN" || cleanMember === "GOLD" || cleanMember === "PLATINUM" || cleanMember === "DIAMOND") {
    membershipBonus = 10;
  }

  const totalFreeAllowance = baseFreeAllowance + membershipBonus;

  // 3. Tinh tong trong luong thuc te va phu phi dac biet tu cac kien hang
  let totalActualWeightKg = 0;
  let totalBulkyFee = 0;
  let totalPetFee = 0;
  const detailedBagsSummary = [];

  if (bags && Array.isArray(bags)) {
    for (let i = 0; i < bags.length; i++) {
      const bag = bags[i];
      const weight = Number(bag.weightKg) || 0;
      totalActualWeightKg += weight;

      let bagSpecialFee = 0;
      if (bag.isBulky) {
        totalBulkyFee += 200000; // Phu phi kien cong kenh: 200k/kien
        bagSpecialFee += 200000;
      }
      if (bag.isPet) {
        totalPetFee += 500000; // Phu phi thu cung: 500k/long
        bagSpecialFee += 500000;
      }

      detailedBagsSummary.push({
        bagId: bag.bagId || `BAG_0${i+1}`,
        weightKg: weight,
        isBulky: bag.isBulky || false,
        isPet: bag.isPet || false,
        specialFee: bagSpecialFee
      });
    }
  }

  // 4. Tinh toan phu phi qua can (Excess Weight Fee)
  let excessWeightKg = 0;
  let weightSurchargeFee = 0;

  if (totalActualWeightKg > totalFreeAllowance) {
    excessWeightKg = totalActualWeightKg - totalFreeAllowance;

    // Quy tac tinh bac thang:
    // - Vuot tu 1 den 5 kg: 60.000 VND / kg
    // - Vuot tren 5 kg: 60.000 VND cho 5kg dau + 80.000 VND cho moi kg tu kg thu 6 tro di
    if (excessWeightKg <= 5) {
      weightSurchargeFee = excessWeightKg * 60000;
    } else {
      const firstFiveKgFee = 5 * 60000;
      const remainingKg = excessWeightKg - 5;
      const remainingKgFee = remainingKg * 80000;
      weightSurchargeFee = firstFiveKgFee + remainingKgFee;
    }
  }

  // 5. Tong cong chi phi phu thu
  const totalSurcharge = weightSurchargeFee + totalBulkyFee + totalPetFee;

  return {
    success: true,
    ticketId: passengerRecord.ticketId,
    passengerName: passengerRecord.passengerName,
    classTier: classTier,
    membershipTier: cleanMember,
    baseFreeAllowance: baseFreeAllowance,
    membershipBonus: membershipBonus,
    totalFreeAllowance: totalFreeAllowance,
    totalActualWeightKg: totalActualWeightKg,
    excessWeightKg: excessWeightKg,
    weightSurchargeFee: weightSurchargeFee,
    totalBulkyFee: totalBulkyFee,
    totalPetFee: totalPetFee,
    totalSurcharge: totalSurcharge,
    bags: detailedBagsSummary
  };
};

// 3. HAM IN BIEN LAI THU PHI HANH LY SAN BAY CHI TIẾT
const printBaggageReceipt = (calculationResult) => {
  if (!calculationResult || !calculationResult.success) {
    console.log("[ERROR]: Khong the xuat bien lai do du lieu khong hop le.");
    return;
  }

  const r = calculationResult;
  const borderLine = "=".repeat(75);
  const thinLine = "-".repeat(75);

  console.log("\n" + borderLine);
  console.log("                  BIEN LAI THU PHI HANH LY KY GUI SAN BAY                  ");
  console.log(borderLine);
  console.log(`  MA VE (TICKET ID) : ${r.ticketId.padEnd(20)} HANG VE  : ${r.classTier}`);
  console.log(`  HANH KHACH        : ${r.passengerName.padEnd(20)} HOI VIEN : ${r.membershipTier}`);
  console.log(thinLine);
  console.log("  CHI TIET DINH MUC & HANH LY:");
  console.log(`  - Han muc co so     : ${r.baseFreeAllowance.toString().padStart(3)} kg`);
  console.log(`  - Uu dai hoi vien   : +${r.membershipBonus.toString().padStart(2)} kg`);
  console.log(`  - Tong mien cuoc    : ${r.totalFreeAllowance.toString().padStart(3)} kg`);
  console.log(`  - Tong trong luong  : ${r.totalActualWeightKg.toString().padStart(3)} kg`);
  console.log(`  - So kg vuot muc    : ${r.excessWeightKg.toString().padStart(3)} kg`);
  console.log(thinLine);
  console.log("  BANG KE CHI TIET KIEN HANG:");

  for (let i = 0; i < r.bags.length; i++) {
    const b = r.bags[i];
    const notes = [];
    if (b.isBulky) notes.push("Cong kenh (+200k)");
    if (b.isPet) notes.push("Thu cung (+500k)");
    const noteStr = notes.length > 0 ? `[${notes.join(", ")}]` : "[Thong thuong]";
    
    console.log(`    + ${b.bagId}: ${b.weightKg.toString().padStart(2)} kg | ${noteStr.padEnd(28)} | Phu phi: ${b.specialFee.toLocaleString()} VND`);
  }

  console.log(thinLine);
  console.log(`  - Phu thu qua can   : ${r.weightSurchargeFee.toLocaleString().padStart(12)} VND`);
  console.log(`  - Phu thu dac biet  : ${(r.totalBulkyFee + r.totalPetFee).toLocaleString().padStart(12)} VND`);
  console.log(borderLine);
  console.log(`  TONG TIEN PHU THU   : ${r.totalSurcharge.toLocaleString().padStart(12)} VND`);
  console.log(borderLine);
};

// 4. CHAY THU NGHIEM TOAN BO KICH BAN
console.log("================================================");
console.log("KICH BAN: TINH TOAN PHU THU VA XUAT BIEN LAI TOAN BO HANG KHACH");
console.log("================================================");

for (let i = 0; i < passengersBaggageRegistry.length; i++) {
  const passenger = passengersBaggageRegistry[i];
  const result = calculateBaggageSurcharge(passenger);
  printBaggageReceipt(result);
}