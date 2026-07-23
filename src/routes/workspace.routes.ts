import express from "express"
import { WorkspacesContorller } from "../controllers/workspace.controller"
import { de } from "zod/v4/locales"

const Router = express.Router()

Router.get('/', WorkspacesContorller.getWorkspaces)
Router.post('/', WorkspacesContorller.createWorkspace)


export default Router
