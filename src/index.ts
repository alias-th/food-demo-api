import { Server } from "./server";

const server = new Server().app;
const port = 8000;

server.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
