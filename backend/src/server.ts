import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";
import lostItemRoutes from "./routes/lost-item.routes";
import foundItemRoutes from "./routes/found-item.routes";
import claimRoutes from "./routes/claim.routes";
import notificationRoutes from "./routes/notification.routes";
import matchRoutes from "./routes/match.routes";
import aiTestRoutes from "./routes/ai-test.routes";
import reportRoutes from "./routes/report.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/lost-items", lostItemRoutes);
app.use("/api/found-items", foundItemRoutes);
app.use("/api", claimRoutes);
app.use("/api", notificationRoutes);
app.use("/api", matchRoutes);
app.use("/api/ai-test", aiTestRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FindIt API running on http://localhost:${PORT}`);
});
