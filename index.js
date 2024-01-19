import express from "express";
import cors from "cors";
import path from "path";
import authRouter from "./routing/authRouter.js";
import accountRouter from "./routing/accountRouter.js";
import pageRouter from "./routing/pageRouter.js";

const app = express();
const PORT = 3001;
const currentFolderPath = path.resolve();
   
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(currentFolderPath, "images"))); // постоянное исп. папки images 

app.use("/catalog", pageRouter);
app.use("/authentication", authRouter);
app.use("/account", accountRouter);

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
})