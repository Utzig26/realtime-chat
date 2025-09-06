/**
 * @swagger
 * components:
 *   tags:
 *     - name: Messages
 *       description: Message management
 */

/**
 * @swagger
 * /conversations/{id}/messages:
 *   get:
 *     summary: Get messages from a conversation
 *     tags: [Messages]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Conversation ID
 *         example: 507f1f77bcf86cd799439011
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         messages:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Message'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             page:
 *                               type: integer
 *                               example: 1
 *                             limit:
 *                               type: integer
 *                               example: 20
 *                             total:
 *                               type: integer
 *                               example: 150
 *                             pages:
 *                               type: integer
 *                               example: 8
 *       400:
 *         description: Invalid conversation ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or expired session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - user not a participant in this conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /conversations/{conversationId}/messages/read:
 *   put:
 *     summary: Mark all messages in a conversation as read
 *     tags: [Messages]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Conversation ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid conversation ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or expired session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - user not a participant in this conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
