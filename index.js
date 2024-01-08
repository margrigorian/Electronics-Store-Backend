import express from "express";
import cors from "cors";
import authRouter from "./routing/authRouter.js";

const app = express();
const PORT = 3001;
   
app.use(cors());
app.use(express.json());

app.use("/authentication", authRouter);

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
})