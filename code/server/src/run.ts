import * as path from "path";
import * as express from "express";
import * as compress from "compression";
import * as http from "http";
import * as nocache from "nocache";

import { createProxyMiddleware } from "http-proxy-middleware";

import { logger } from "./logging";

logger.info("starting web server");

// setup express
const app = express();
const httpServer = http.createServer(app);

// enable compression
app.use(compress());

// disable caching
app.use(nocache());
app.set("etag", false);

// proxy api calls
app.use("/api", createProxyMiddleware({ 
    target: "http://localhost:8000/api", 
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req) => {
            if ('x-auth-token' in req.headers) {
                proxyReq.setHeader('Authorization', req.headers['x-auth-token']);
            }
        }
    }
}));

// serve static files
const pathToStatic = path.join(__dirname, "../../../frontend/dist");
logger.info(`serving from ${pathToStatic}`);
app.use(express.static(pathToStatic, { etag: false }));

const serverHandle = httpServer.listen(8080, () => {
    logger.info("listening on http://localhost:8080/");
});

const cleanup = async () => {
    if (serverHandle) {
        logger.info("stop web server");
        serverHandle.close();
    }
};

const exitHandler = async (signal: string) => {
    logger.info(`shutdown via ${signal}`);
    await cleanup();
    process.kill(process.pid, signal);
};

["SIGUSR2", "SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => process.once(signal, exitHandler));
