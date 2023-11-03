const express = require('express');
const router = new express.Router();
const projectsController = require('../../controllers/v1/projectsController');
const projectValidation = require('../../validations/project');
const tenantValidations = require('../../validations/tenant');
const tenantControllers = require('../../controllers/v1/tenantController');
const {
  authenticationTokenMiddleware,
  authenticationTokenValidationMiddleware,
  authenticationRefreshTokenMiddleware,
} = require('../../middleware/authMiddleware');
const {
  authenticationForgetPasswordMiddleware,
} = require('../../middleware/forgetPasswordMiddleware');
const loginController = require('../../controllers/v1/loginController');
const loginValidation = require('../../validations/login');
const forgetPasswordController = require('../../controllers/v1/forgetPasswordController');
const forgetPasswordValidation = require('../../validations/forgetPassword');
const boardController = require('../../controllers/v1/boardController');
const boardValidation = require('../../validations/board');
const taskController = require('../../controllers/v1/taskController');
const taskValidation = require('../../validations/task');
const userControllers = require('../../controllers/v1/userController');
const userValidation = require('../../validations/user');
const commentControllers = require('../../controllers/v1/commentController');
const commentValidation = require('../../validations/comment');
const accountSettingControllers = require('../../controllers/v1/accountSettingController');
const accountSettingValidation = require('../../validations/accountSetting');
const shortcutControllers = require('../../controllers/v1/shortcutController');
const shortcutValidation = require('../../validations/shortcut');
const labelController = require('../../controllers/v1/labelController');
const labelValidation = require('../../validations/label');
const multerMiddleware = require('../../middleware/multerMiddleware');
const saasMiddleware = require('../../middleware/saasMiddleware');
const userPageControllers = require('../../controllers/v1/userPageController');
const userPageValidation = require('../../validations/userPage');
const permissionMiddleware = require('../../middleware/permissionMiddleware');
const memberController = require('../../controllers/v1/memberController');
const memberValidation = require('../../validations/member');
const roleController = require('../../controllers/v1/roleController');
const roleValidation = require('../../validations/role');
const permissionController = require('../../controllers/v1/permissionController');
const typeController = require('../../controllers/v1/typeController');
const contactController = require('../../controllers/v1/contactController');
const contactValidation = require('../../validations/contact');
const emailUsController = require('../../controllers/v1/emailUsController');
const database = require('../../database/init');
const domainController = require('../../controllers/v1/domainsController');
const activityControllers = require('../../controllers/v1/activityController');
const dailyScrumControllers = require('../../controllers/v1/dailyScrumController');
const dailyScrumValidations = require('../../validations/dailyScrum');
const paymentController = require('../../controllers/v1/paymentController');
import * as sprintController from '../../controllers/v1/sprintController';
import * as sprintValidation from '../../validations/sprintValidation';
import * as backlogController from '../../controllers/v1/backlogController';
import * as statusesController from '../../controllers/v1/statusController';
import * as statuseValidation from '../../validations/statusValidation';

router.get('/', (req: any, res: any) => {
  res.sendStatus(201);
});

router.get('/domains', domainController.index);

router.post('/contacts', contactValidation.store, contactController.store);
router.post('/emailus', contactValidation.contactForm, emailUsController.contactForm);
router.all('*', saasMiddleware.saas);
/* https://blog.logrocket.com/documenting-your-express-api-with-swagger/ */
/**
 * @swagger
 * components:
 *   schemas:
 *     Tenants:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID.
 *           example: 0
 *         name:
 *           type: string
 *           description: The user's name.
 *           example: Leanne Graham
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID.
 *           example: 0
 *         name:
 *           type: string
 *           description: The user's name.
 *           example: Leanne Graham
 */

/**
 * @swagger
 * /tenants:
 *   get:
 *     summary: Retrieve a list of tenants
 *     description: Retrieve a list of tenants.
 *     parameters:
 *       - in: query
 *         name: domain
 *         required: true
 *         description: Domain of the url.
 *         schema:
 *           type: string
 *       - in: query
 *         name: name
 *         required: true
 *         description: App name.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenants'
 */
router.get('/tenants', tenantValidations.index, tenantControllers.index);
router.post('/tenants', tenantValidations.store, tenantControllers.store);

router.post('/login', loginValidation.login, loginController.login);



router.post(
  '/reset-password',
  forgetPasswordValidation.forgetPasswordApplication,
  forgetPasswordController.forgetPasswordApplication,
);
router.get(
  '/change-password/:token',
  authenticationForgetPasswordMiddleware,
  forgetPasswordController.getUserEmail,
);
router.put(
  '/change-password/:token',
  authenticationForgetPasswordMiddleware,
  forgetPasswordValidation.updateUserPassword,
  forgetPasswordController.updateUserPassword,
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Tenants:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID.
 *           example: 0
 *         name:
 *           type: string
 *           description: The user's name.
 *           example: Leanne Graham
 */

/**
 * @swagger
 * /tenants:
 *   get:
 *     summary: Retrieve an user
 *     description: Retrieve an user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Domain of the url.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: return an users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

router.get('/users', userControllers.index);
router.get('/users/:id', userValidation.show, userControllers.show);
router.put('/users/:id', userPageValidation.update, userPageControllers.update);

router.get('/comments/:id', commentControllers.show);
router.post('/comments', commentValidation.store, commentControllers.store);
router.put('/comments/:id', commentValidation.update, commentControllers.update);
router.delete('/comments/:id', commentValidation.remove, commentControllers.destroy);

router.delete('/comments/:id', commentControllers.destroy);

router.get(
  '/tasks/project/:id',
  projectValidation.show,
  authenticationTokenMiddleware,
  taskController.tasksByProject,
);
router.get('/tasks/:id', taskValidation.show, taskController.show);
router.post('/tasks', taskValidation.store, authenticationTokenMiddleware, taskController.store);
router.put('/tasks/:id', taskValidation.update, taskController.update);
router.put('/tasks/:id/toggleActive', taskValidation.update, taskController.toggleActivate);
router.delete('/tasks/:id', taskValidation.remove, taskController.delete);

router.put(
  '/account/me',
  accountSettingValidation.update,
  authenticationTokenMiddleware,
  accountSettingControllers.update,
);
router.delete(
  '/account/me',
  accountSettingValidation.remove,
  authenticationTokenMiddleware,
  accountSettingControllers.destroy,
);

router.patch(
  '/account/change-password',
  authenticationTokenMiddleware,
  accountSettingControllers.updatePassword,
);

router.post(
  '/auto-fetch-userInfo',
  authenticationTokenValidationMiddleware,
  authenticationRefreshTokenMiddleware,
  loginController.autoFetchUserInfo,
);

router.get('/projects', authenticationTokenMiddleware, projectsController.index);
router.get(
  '/projects/:id',
  authenticationTokenMiddleware,
  permissionMiddleware.permission('view:projects'),
  projectValidation.show,
  projectsController.show,
);
router.put(
  '/projects/:id',
  authenticationTokenMiddleware,
  permissionMiddleware.permission('edit:projects'),
  projectValidation.update,
  projectsController.update,
);
router.post(
  '/projects',
  authenticationTokenMiddleware,
  projectValidation.store,
  projectsController.store,
);
router.delete(
  '/projects/:id',
  authenticationTokenMiddleware,
  permissionMiddleware.permission('delete:projects'),
  projectValidation.remove,
  projectsController.delete,
);

router.post('/projects/:id/shortcuts', shortcutValidation.store, shortcutControllers.store);
router.put(
  '/projects/:projectId/shortcuts/:shortcutId',
  shortcutValidation.update,
  shortcutControllers.update,
);
router.delete(
  '/projects/:projectId/shortcuts/:shortcutId',
  shortcutValidation.remove,
  shortcutControllers.destroy,
);

router.get('/projects/:id/members', memberController.index);
router.put(
  '/projects/:projectId/members/:userId',
  memberValidation.update,
  memberController.update,
);
router.delete(
  '/projects/:projectId/members/:userId',
  memberValidation.remove,
  memberController.delete,
);
router.post(
  '/projects/:projectId/members/invite',
  memberValidation.invite,
  memberController.invite,
);

// roleV2
router.get('/permissions', permissionController.index);
// get all roles from peoject
router.get('/projects/:projectId/roles', roleValidation.getProject, roleController.index);
router.get(
  '/projects/:projectId/roles/:roleId',
  roleValidation.projectAndRole,
  roleController.getRoleById,
);
// add new role
router.put(
  '/projects/:projectId/roles',
  roleValidation.getProject,
  authenticationTokenMiddleware,
  roleController.addNewRole,
);
// update role
router.put(
  '/projects/:projectId/roles/:roleId',
  roleValidation.projectAndRole,
  authenticationTokenMiddleware,
  roleController.update,
);
// delete role
router.delete(
  '/projects/:projectId/roles/:roleId',
  roleValidation.projectAndRole,
  authenticationTokenMiddleware,
  roleController.delete,
);

router.post('/uploads', multerMiddleware.array('photos'), (req: any, res: any) => {
  res.status(200).json(req.files);
});

router.get('/types', typeController.index);

router.get(
  '/board/:id/:inputFilter/:userFilter/:taskTypeFilter/:labelFilter',
  boardValidation.show,
  boardController.show,
);

router.get('/abc', async (req: any) => {
  database.init(req.dbConnection);
});

router.get('/labels', labelController.index);
router.get('/labels/:projectId', labelController.index);
router.get('/projects/:projectId/labels', labelController.index);
router.post('/tasks/:taskId/labels', labelValidation.store, labelController.store);
router.delete('/tasks/:taskId/labels/:labelId', labelValidation.eliminate, labelController.remove);
router.put('/labels/:id', labelValidation.update, labelController.update);
router.delete('/labels/:id', labelValidation.remove, labelController.delete);

// backlogs
router.get('/projects/:projectId/backlogs', backlogController.index);
router.get('/projects/:projectId/backlogs/search', backlogController.searchBacklogTasks);
router.get(
  '/projects/:projectId/backlogs/:inputCase/:userCase/:typeCase/:labelCase',
  backlogController.filter,
);

// sprints
router.get('/sprints', sprintController.show);
router.post('/sprints', sprintValidation.store, sprintController.store);
router.put('/sprints/:id', sprintController.update);
router.delete('/sprints/:id', sprintController.destroy);

// statuses
router.get('/boards/:boardId/statuses', statuseValidation.index, statusesController.index);

//activities
router.get('/activities/:tid', activityControllers.show);
router.post('/activities', activityControllers.store);
router.delete('/activities/:id', activityControllers.destroy);

//dailyScrums
router.get(
  '/projects/:projectId/dailyScrums',
  dailyScrumValidations.show,
  dailyScrumControllers.show,
);
router.post(
  '/projects/:projectId/dailyScrums',
  dailyScrumValidations.store,
  dailyScrumControllers.store,
);
router.patch(
  '/projects/:projectId/dailyScrums/:dailyScrumId',
  dailyScrumValidations.update,
  dailyScrumControllers.update,
);
router.delete(
  '/projects/:projectId/dailyScrums',
  dailyScrumValidations.destroy,
  dailyScrumControllers.destroy,
);

// payment
router.post('/payment', paymentController.createPayment);


module.exports = router;
