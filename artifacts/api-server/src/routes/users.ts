import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateUserBody, GetUserParams, UpdateUserParams, UpdateUserBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(users);
});

router.get("/:id", async (req, res) => {
  const { id } = GetUserParams.parse(req.params);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

router.post("/", async (req, res) => {
  const body = CreateUserBody.parse(req.body);
  const [user] = await db
    .insert(usersTable)
    .values({ ...body, role: body.role as "tenant" | "owner" | "admin" })
    .returning();
  res.status(201).json(user);
});

router.put("/:id", async (req, res) => {
  const { id } = UpdateUserParams.parse(req.params);
  const body = UpdateUserBody.parse(req.body);
  const [user] = await db
    .update(usersTable)
    .set(body)
    .where(eq(usersTable.id, id))
    .returning();
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

export default router;
