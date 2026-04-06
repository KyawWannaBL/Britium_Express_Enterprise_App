import { SetMetadata } from "@nestjs/common";
export const BRANCH_SCOPED_KEY = "branchScoped";
export const BranchScoped = () => SetMetadata(BRANCH_SCOPED_KEY, true);
