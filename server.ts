import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { User, Printer, PrintJob, Transaction, SystemLog } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Mock Database ---
  let users: User[] = [
    {
      id: "u1",
      username: "admin",
      fullName: "Ali Alhashim",
      email: "a.alhashim75@gmail.com",
      role: "ADMIN",
      balance: 500.0,
      totalPagesPrinted: 1240,
      totalJobsSubmitted: 85,
      restricted: false,
      department: "IT Administration"
    },
    {
      id: "u2",
      username: "subadmin",
      fullName: "Mohammed Alshammasi",
      email: "m.shammasi@kfupm.edu.sa",
      role: "SUB_ADMIN",
      balance: 100.0,
      totalPagesPrinted: 450,
      totalJobsSubmitted: 32,
      restricted: false,
      department: "CCM Technical Staff"
    },
    {
      id: "u3",
      username: "student1",
      fullName: "Ali Aloryd",
      email: "s202322750@kfupm.edu.sa",
      role: "USER",
      balance: 25.50,
      totalPagesPrinted: 120,
      totalJobsSubmitted: 15,
      restricted: false,
      department: "Computer Science"
    }
  ];

  let printers: Printer[] = [
    { id: "p1", name: "CCM-Lobby-01", location: "Building 22, Lobby", status: "ACTIVE", type: "PHYSICAL", pageCost: 0.10, totalPagesPrinted: 15000, totalJobsSubmitted: 2100 },
    { id: "p2", name: "CCM-Lab-A", location: "Building 22, Room 105", status: "ACTIVE", type: "PHYSICAL", pageCost: 0.10, totalPagesPrinted: 8500, totalJobsSubmitted: 1200 },
    { id: "p3", name: "CCM-Faculty-01", location: "Building 22, Floor 2", status: "LOW_TONER", type: "PHYSICAL", pageCost: 0.05, totalPagesPrinted: 3200, totalJobsSubmitted: 450 },
    { id: "p4", name: "Virtual-Queue", location: "Cloud", status: "ACTIVE", type: "VIRTUAL", pageCost: 0.10, totalPagesPrinted: 0, totalJobsSubmitted: 0 }
  ];

  let printJobs: PrintJob[] = [
    {
      id: "j1",
      userId: "u3",
      userName: "Ali Aloryd",
      fileName: "CS301_Assignment_1.pdf",
      fileSize: 1024 * 500,
      pageCount: 5,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
      attributes: { color: false, duplex: true },
      cost: 0.50
    }
  ];

  let transactions: Transaction[] = [];
  let logs: SystemLog[] = [
    { id: "l1", timestamp: new Date().toISOString(), level: "INFO", message: "System initialized", source: "SERVER" }
  ];

  // --- API Routes ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { username } = req.body;
    const user = users.find(u => u.username === username);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Users
  app.get("/api/users", (req, res) => res.json(users));
  app.patch("/api/users/:id/balance", (req, res) => {
    const { id } = req.params;
    const { amount, comment } = req.body;
    const user = users.find(u => u.id === id);
    if (user) {
      user.balance += amount;
      transactions.push({
        id: Math.random().toString(36).substr(2, 9),
        userId: id,
        type: amount > 0 ? "CREDIT_ADDITION" : "ADJUSTMENT",
        amount: Math.abs(amount),
        balanceAfter: user.balance,
        timestamp: new Date().toISOString(),
        comment
      });
      res.json(user);
    } else res.status(404).send();
  });

  // Printers
  app.get("/api/printers", (req, res) => res.json(printers));

  // Print Jobs
  app.get("/api/jobs", (req, res) => res.json(printJobs));
  app.post("/api/jobs", (req, res) => {
    const job: PrintJob = {
      ...req.body,
      id: "j" + Math.random().toString(36).substr(2, 9),
      submittedAt: new Date().toISOString(),
      status: "PENDING"
    };
    printJobs.push(job);
    res.json(job);
  });

  app.post("/api/jobs/:id/release", (req, res) => {
    const { id } = req.params;
    const { printerId } = req.body;
    const job = printJobs.find(j => j.id === id);
    const user = users.find(u => u.id === job?.userId);
    const printer = printers.find(p => p.id === printerId);

    if (job && user && printer && job.status === "PENDING") {
      if (user.balance >= job.cost) {
        user.balance -= job.cost;
        user.totalPagesPrinted += job.pageCount;
        user.totalJobsSubmitted += 1;
        printer.totalPagesPrinted += job.pageCount;
        printer.totalJobsSubmitted += 1;
        job.status = "PRINTED";
        job.printedAt = new Date().toISOString();
        job.printerId = printerId;

        transactions.push({
          id: "t" + Math.random().toString(36).substr(2, 9),
          userId: user.id,
          type: "PRINT_DEDUCTION",
          amount: job.cost,
          balanceAfter: user.balance,
          timestamp: new Date().toISOString(),
          comment: `Printed: ${job.fileName}`
        });

        logs.push({
          id: "l" + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          level: "INFO",
          message: `Job ${job.id} released at ${printer.name} by ${user.username}`,
          userId: user.id,
          source: "PRINTER_DEVICE"
        });

        res.json(job);
      } else {
        res.status(400).json({ error: "Insufficient balance" });
      }
    } else res.status(404).send();
  });

  // Logs
  app.get("/api/logs", (req, res) => res.json(logs));

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
