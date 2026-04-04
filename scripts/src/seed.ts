import { db } from "@workspace/db";
import {
  usersTable,
  listingsTable,
  applicationsTable,
  contractsTable,
  rentalsTable,
  paymentsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  await db.execute(sql`TRUNCATE payments, rentals, contracts, applications, listings, users RESTART IDENTITY CASCADE`);

  // Users
  const users = await db.insert(usersTable).values([
    {
      name: "Sardor Yusupov",
      email: "sardor@example.com",
      phone: "+998901234567",
      role: "tenant",
      verified: true,
      myIdVerified: true,
      avatarUrl: null,
    },
    {
      name: "Dilnoza Karimova",
      email: "dilnoza@example.com",
      phone: "+998907654321",
      role: "owner",
      verified: true,
      myIdVerified: true,
      avatarUrl: null,
    },
    {
      name: "Jasur Toshmatov",
      email: "jasur@example.com",
      phone: "+998901112233",
      role: "owner",
      verified: true,
      myIdVerified: false,
      avatarUrl: null,
    },
    {
      name: "Admin Kvarenda",
      email: "admin@kvarenda.uz",
      phone: "+998990000001",
      role: "admin",
      verified: true,
      myIdVerified: true,
      avatarUrl: null,
    },
    {
      name: "Malika Rahimova",
      email: "malika@example.com",
      phone: "+998905556677",
      role: "tenant",
      verified: true,
      myIdVerified: false,
      avatarUrl: null,
    },
    {
      name: "Bobur Mirzayev",
      email: "bobur@example.com",
      phone: "+998901234000",
      role: "owner",
      verified: false,
      myIdVerified: false,
      avatarUrl: null,
    },
  ]).returning();

  console.log(`Inserted ${users.length} users`);

  // Listings with various Tashkent districts
  const listings = await db.insert(listingsTable).values([
    {
      ownerId: users[1].id,
      title: "Modern 2-bedroom apartment in Yunusobod",
      description: "Bright and spacious apartment on the 7th floor with panoramic city views. Fully renovated with modern fixtures, new appliances, and high-speed fiber internet included. Located in a quiet residential block with 24/7 security and underground parking.",
      address: "Yunusobod tumani, 9-mavze, 15-uy",
      district: "Yunusobod",
      rooms: 2,
      floor: 7,
      totalFloors: 12,
      area: 72.5,
      priceUzs: 4500000,
      deposit: 4500000,
      plan: "pro",
      status: "active",
      published: true,
      verified: true,
      has3dTour: true,
      hasInsurance: true,
      insuranceStatus: "insured",
      amenities: ["WiFi", "Air conditioning", "Washing machine", "Dishwasher", "Parking", "Elevator", "Security"],
      photos: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
      ],
      rules: "No smoking, no pets, no loud noise after 22:00",
      latitude: 41.3345,
      longitude: 69.3456,
    },
    {
      ownerId: users[1].id,
      title: "Cozy studio in Mirzo Ulugbek",
      description: "Well-maintained studio apartment perfect for students or working professionals. Close to Mirzo Ulugbek metro station. Recently renovated with a modern kitchen and bathroom.",
      address: "Mirzo Ulugbek tumani, Qoratosh ko'chasi, 42-uy",
      district: "Mirzo Ulugbek",
      rooms: 1,
      floor: 3,
      totalFloors: 9,
      area: 38,
      priceUzs: 2200000,
      deposit: 2200000,
      plan: "pro",
      status: "active",
      published: true,
      verified: true,
      has3dTour: false,
      hasInsurance: true,
      insuranceStatus: "available",
      amenities: ["WiFi", "Air conditioning", "Washing machine", "Elevator"],
      photos: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
      ],
      rules: "No smoking indoors, no pets",
      latitude: 41.3567,
      longitude: 69.3234,
    },
    {
      ownerId: users[2].id,
      title: "Spacious 3-bedroom family apartment in Chilonzor",
      description: "Large family apartment with three bedrooms, two bathrooms, and a spacious living area. Located in a green neighborhood with schools and parks nearby. Building has a children's playground.",
      address: "Chilonzor tumani, 14-mavze, 7-uy",
      district: "Chilonzor",
      rooms: 3,
      floor: 5,
      totalFloors: 10,
      area: 95,
      priceUzs: 5800000,
      deposit: 5800000,
      plan: "basic",
      status: "active",
      published: true,
      verified: true,
      has3dTour: false,
      hasInsurance: false,
      insuranceStatus: "none",
      amenities: ["WiFi", "Air conditioning", "Washing machine", "Balcony", "Parking"],
      photos: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
      ],
      rules: "Families preferred, no smoking",
      latitude: 41.3123,
      longitude: 69.2678,
    },
    {
      ownerId: users[2].id,
      title: "Premium penthouse in Yakkasaroy",
      description: "Luxury penthouse apartment on the top floor with stunning views of the city. Features two large terraces, premium finishes, and smart home automation. Includes private parking space.",
      address: "Yakkasaroy tumani, Amir Temur shohko'chasi, 108-uy",
      district: "Yakkasaroy",
      rooms: 4,
      floor: 14,
      totalFloors: 14,
      area: 160,
      priceUzs: 12000000,
      deposit: 12000000,
      plan: "pro",
      status: "active",
      published: true,
      verified: true,
      has3dTour: true,
      hasInsurance: true,
      insuranceStatus: "insured",
      amenities: ["WiFi", "Air conditioning", "Smart home", "Gym", "Pool", "Concierge", "Parking", "Terrace"],
      photos: [
        "https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800",
      ],
      rules: "No parties, no smoking, no pets",
      latitude: 41.2978,
      longitude: 69.2934,
    },
    {
      ownerId: users[5].id,
      title: "Budget-friendly 1-bedroom in Uchtepa",
      description: "Affordable and clean one-bedroom apartment suitable for a single person or couple. Quiet neighborhood with good transport links.",
      address: "Uchtepa tumani, Yangi Uchtepa ko'chasi, 23-uy",
      district: "Uchtepa",
      rooms: 1,
      floor: 2,
      totalFloors: 5,
      area: 45,
      priceUzs: 1800000,
      deposit: 1800000,
      plan: "basic",
      status: "active",
      published: true,
      verified: false,
      has3dTour: false,
      hasInsurance: false,
      insuranceStatus: "none",
      amenities: ["WiFi", "Air conditioning"],
      photos: [
        "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
      ],
      rules: "No smoking",
      latitude: 41.3012,
      longitude: 69.2456,
    },
    {
      ownerId: users[1].id,
      title: "Modern 2-bedroom in Shaykhontohur",
      description: "Newly renovated apartment in central Tashkent. Walking distance from Chorsu bazaar and many restaurants. Great for those who enjoy urban living.",
      address: "Shaykhontohur tumani, Yusuf Xos Hojib ko'chasi, 5-uy",
      district: "Shaykhontohur",
      rooms: 2,
      floor: 4,
      totalFloors: 8,
      area: 65,
      priceUzs: 3800000,
      deposit: 3800000,
      plan: "pro",
      status: "active",
      published: true,
      verified: true,
      has3dTour: true,
      hasInsurance: false,
      insuranceStatus: "available",
      amenities: ["WiFi", "Air conditioning", "Washing machine", "Elevator", "Security"],
      photos: [
        "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800",
        "https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800",
      ],
      rules: "No smoking, no pets",
      latitude: 41.3234,
      longitude: 69.2789,
    },
  ]).returning();

  console.log(`Inserted ${listings.length} listings`);

  // Applications
  const applications = await db.insert(applicationsTable).values([
    {
      listingId: listings[0].id,
      tenantId: users[0].id,
      moveInDate: "2026-05-01",
      durationMonths: 12,
      purpose: "Family residence",
      message: "Hello, I am a software engineer looking for a comfortable apartment for my family. I have stable income and good references from previous landlords.",
      status: "approved",
    },
    {
      listingId: listings[2].id,
      tenantId: users[4].id,
      moveInDate: "2026-05-15",
      durationMonths: 6,
      purpose: "Working near this district",
      message: "I work nearby and need a comfortable apartment for 6 months. I am a clean and responsible tenant.",
      status: "pending",
    },
    {
      listingId: listings[1].id,
      tenantId: users[0].id,
      moveInDate: "2026-04-01",
      durationMonths: 3,
      purpose: "Temporary accommodation",
      message: "Looking for a short-term rental while my permanent place is being renovated.",
      status: "rejected",
      note: "We prefer longer term rentals at this time.",
    },
  ]).returning();

  console.log(`Inserted ${applications.length} applications`);

  // Contract for approved application
  const contracts = await db.insert(contractsTable).values([
    {
      applicationId: applications[0].id,
      listingId: listings[0].id,
      tenantId: users[0].id,
      ownerId: users[1].id,
      startDate: "2026-05-01",
      endDate: "2027-05-01",
      monthlyRentUzs: listings[0].priceUzs,
      depositUzs: listings[0].deposit ?? 0,
      serviceFeePercent: 5,
      status: "active",
      tenantSigned: true,
      ownerSigned: true,
      tenantSignedAt: new Date("2026-04-20"),
      ownerSignedAt: new Date("2026-04-21"),
      terms: `This rental agreement is made between Dilnoza Karimova (Owner) and Sardor Yusupov (Tenant) for the property at ${listings[0].address}. The monthly rent is ${listings[0].priceUzs.toLocaleString()} UZS plus 5% platform service fee. The deposit amount is ${(listings[0].deposit ?? 0).toLocaleString()} UZS. The tenant must maintain the property in good condition and follow all house rules. Kvarenda LLC serves as the platform facilitator and holds the platform service fee.`,
    },
  ]).returning();

  console.log(`Inserted ${contracts.length} contracts`);

  // Active rental
  const rentals = await db.insert(rentalsTable).values([
    {
      contractId: contracts[0].id,
      listingId: listings[0].id,
      tenantId: users[0].id,
      ownerId: users[1].id,
      monthlyRentUzs: listings[0].priceUzs,
      serviceFeeUzs: Math.round(listings[0].priceUzs * 0.05),
      startDate: "2026-05-01",
      endDate: "2027-05-01",
      status: "active",
      protectedRent: true,
    },
  ]).returning();

  console.log(`Inserted ${rentals.length} rentals`);

  // Payments
  await db.insert(paymentsTable).values([
    {
      rentalId: rentals[0].id,
      tenantId: users[0].id,
      period: "2026-05",
      amountUzs: listings[0].priceUzs,
      serviceFeeUzs: Math.round(listings[0].priceUzs * 0.05),
      totalUzs: listings[0].priceUzs + Math.round(listings[0].priceUzs * 0.05),
      method: "online",
      status: "completed",
      ownerConfirmed: true,
      paidAt: new Date("2026-05-01"),
    },
    {
      rentalId: rentals[0].id,
      tenantId: users[0].id,
      period: "2026-06",
      amountUzs: listings[0].priceUzs,
      serviceFeeUzs: Math.round(listings[0].priceUzs * 0.05),
      totalUzs: listings[0].priceUzs + Math.round(listings[0].priceUzs * 0.05),
      method: "cash",
      status: "completed",
      ownerConfirmed: true,
      paidAt: new Date("2026-06-02"),
    },
    {
      rentalId: rentals[0].id,
      tenantId: users[0].id,
      period: "2026-07",
      amountUzs: listings[0].priceUzs,
      serviceFeeUzs: Math.round(listings[0].priceUzs * 0.05),
      totalUzs: listings[0].priceUzs + Math.round(listings[0].priceUzs * 0.05),
      method: "online",
      status: "pending",
      ownerConfirmed: false,
    },
  ]);

  console.log("Seed complete!");
}

seed().catch(console.error).finally(() => process.exit(0));
