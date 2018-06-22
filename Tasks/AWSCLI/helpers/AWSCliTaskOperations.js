"use strict";
/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("vsts-task-lib/task");
class TaskOperations {
    static checkIfAwsCliIsInstalled() {
        try {
            return !!tl.which('aws', true);
        }
        catch (error) {
            tl.setResult(tl.TaskResult.Failed, tl.loc('AWSCLINotInstalled'));
        }
    }
    static executeCommand(taskParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.configureAwsCli(taskParameters);
                yield taskParameters.configureHttpProxyFromAgentProxyConfiguration('AWSCLI');
                const awsCliPath = tl.which('aws');
                const awsCliTool = tl.tool(awsCliPath);
                awsCliTool.arg(taskParameters.awsCliCommand);
                awsCliTool.arg(taskParameters.awsCliSubCommand);
                if (taskParameters.awsCliParameters != null) {
                    awsCliTool.line(taskParameters.awsCliParameters);
                }
                const code = yield awsCliTool.exec({ failOnStdErr: taskParameters.failOnStandardError });
                tl.debug(`return code: ${code}`);
                if (code !== 0) {
                    tl.setResult(tl.TaskResult.Failed, tl.loc('AwsReturnCode', awsCliTool, code));
                }
                else {
                    tl.setResult(tl.TaskResult.Succeeded, tl.loc('AwsReturnCode', awsCliTool, code));
                }
            }
            catch (err) {
                tl.setResult(tl.TaskResult.Failed, err.message);
            }
        });
    }
    static configureAwsCli(taskParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            // if assume role credentials are in play, make sure the initial generation
            // of temporary credentials has been performed
            yield taskParameters.Credentials.getPromise().then(() => {
                // push credentials and region into environment variables rather than a
                // stored profile, as this isolates parallel builds and avoids content left
                // lying around on the agent when a build completes
                const env = process.env;
                tl.debug('configure credentials into environment variables');
                env.AWS_ACCESS_KEY_ID = taskParameters.Credentials.accessKeyId;
                env.AWS_SECRET_ACCESS_KEY = taskParameters.Credentials.secretAccessKey;
                if (taskParameters.Credentials.sessionToken) {
                    env.AWS_SESSION_TOKEN = taskParameters.Credentials.sessionToken;
                }
                tl.debug('configure region into environment variable');
                env.AWS_DEFAULT_REGION = taskParameters.awsRegion;
            });
        });
    }
}
exports.TaskOperations = TaskOperations;
//# sourceMappingURL=AWSCliTaskOperations.js.map