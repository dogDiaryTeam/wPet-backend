import { Router } from "express";
import { getTest } from "../controllers/test.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *  name: users
 *  description: API to manage users.
 */
/**
 * @swagger
 * paths:
 *  /test:
 *      get:
 *          summary: Return a hello
 *          tags: [users]
 *          responses:
 *              "200":
 *                  description: the hello
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  type: Object
 */
router.get("/test", getTest);

export default router;
