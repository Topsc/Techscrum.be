export {};
import { Response, Request, NextFunction } from 'express';

const Role = require('../model/role');
const Permission = require('../model/permission');
const Project = require('../model/project');

const getProjectRoleId = (projectId:string, projectRole:any) =>{
  let roleId = null;
  projectRole.forEach((element: { projectId: { toString: () => string; }; roleId: any; }) => {
    if (element.projectId.toString() === projectId.toString()) {
      roleId =  element.roleId;
    }
  });
  return roleId;
};

const hasPermission = async (role:any, slug:string, req:Request) =>{
  const permissionPopulate = await role.populate({ path: 'permission', Model: Permission.getModel(req.dbConnection) });
  permissionPopulate.permission.forEach((element: { slug: string; }) => {
    if (element.slug === slug) {
      return true;
    }
  });
  return false;
};


const checkIsOwner = async (projectId: string, userId: string, req:Request) => {
  const project = await Project.getModel(req.dbConnection).findById(projectId);
  return project.ownerId.toString() === userId;
};

const permission = (slug: string) =>{ 
  return async (req: Request, res: Response, next: NextFunction) => {
    const user:any = req.user;
    const projectId = req.params.id || req.params.projectId;
    const projectRole = user.projectsRoles;
    if (user.isAdmin || await checkIsOwner(projectId, user.id, req)) {
      next();
      return;
    }

    const roleId = getProjectRoleId(projectId, projectRole);

    if (!roleId) {
      res.status(403).send('no role id');
      return;
    }
    const role = await Role.getModel(req.dbConnection).findById(roleId);
    if (!role) {
      res.status(403).send('Cannot find roloe');
      return;
    }

    if (!hasPermission(role, slug, req)) {
      res.status(403).send('nothing');
      return;
    }
    next();
  };

};

module.exports = { permission };
