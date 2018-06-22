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
const fs = require("fs");
const path = require("path");
const tl = require("vsts-task-lib/task");
var uuidV4 = require('uuid/v4');
class TaskOperations {
    static checkIfAwsCliIsInstalled() {
        try {
            return !!tl.which('aws', true);
        }
        catch (error) {
            tl.setResult(tl.TaskResult.Failed, tl.loc('AWSCLINotInstalled'));
        }
    }
    static translateDirectoryPath(bashPath, directoryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let bashPwd = tl.tool(bashPath)
                .arg('--noprofile')
                .arg('--norc')
                .arg('-c')
                .arg('pwd');
            let bashPwdOptions = {
                cwd: directoryPath,
                failOnStdErr: true,
                errStream: process.stdout,
                outStream: process.stdout,
                ignoreReturnCode: false
            };
            let pwdOutput = '';
            bashPwd.on('stdout', (data) => {
                pwdOutput += data.toString();
            });
            yield bashPwd.exec(bashPwdOptions);
            pwdOutput = pwdOutput.trim();
            if (!pwdOutput) {
                throw new Error(tl.loc('JS_TranslatePathFailed', directoryPath));
            }
            return `${pwdOutput}`;
        });
    }
    static executeCommand(taskParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                tl.setResourcePath(path.join(__dirname, 'task.json'));
                // Generate the script contents.
                console.log(tl.loc('GeneratingScript'));
                let bashPath = tl.which('bash', true);
                let contents;
                if (taskParameters.targetType.toUpperCase() == 'FILEPATH') {
                    // Translate the target file path from Windows to the Linux file system.
                    let targetFilePath;
                    if (process.platform == 'win32') {
                        targetFilePath = (yield this.translateDirectoryPath(bashPath, path.dirname(taskParameters.filePath))) + '/' + path.basename(taskParameters.filePath);
                    }
                    else {
                        targetFilePath = taskParameters.filePath;
                    }
                    contents = `. '${targetFilePath.replace("'", "'\\''")}' ${taskParameters.arguments}`.trim();
                    console.log(tl.loc('JS_FormattedCommand', contents));
                }
                else {
                    contents = taskParameters.script;
                    // Print one-liner scripts.
                    if (contents.indexOf('\n') < 0 && contents.toUpperCase().indexOf('##VSO[') < 0) {
                        console.log(tl.loc('JS_ScriptContents'));
                        console.log(contents);
                    }
                }
                yield this.configureAwsCli(taskParameters);
                yield taskParameters.configureHttpProxyFromAgentProxyConfiguration('AWSBash');
                // Write the script to disk.
                tl.assertAgent('2.115.0');
                let tempDirectory = tl.getVariable('agent.tempDirectory');
                tl.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);
                let fileName = uuidV4() + '.sh';
                let filePath = path.join(tempDirectory, fileName);
                yield fs.writeFileSync(filePath, contents, { encoding: 'utf8' });
                // Translate the script file path from Windows to the Linux file system.
                if (process.platform == 'win32') {
                    filePath = (yield this.translateDirectoryPath(bashPath, tempDirectory)) + '/' + fileName;
                }
                // Create the tool runner.
                let bash = tl.tool(bashPath)
                    .arg('--noprofile')
                    .arg('--norc')
                    .arg(filePath);
                let options = {
                    cwd: taskParameters.workingDirectory,
                    failOnStdErr: false,
                    errStream: process.stdout,
                    outStream: process.stdout,
                    ignoreReturnCode: true
                };
                // Listen for stderr.
                let stderrFailure = false;
                if (taskParameters.failOnStderr) {
                    bash.on('stderr', (data) => {
                        stderrFailure = true;
                    });
                }
                // Run bash.
                let exitCode = yield bash.exec(options);
                tl.debug(`return code: ${exitCode}`);
                if (exitCode !== 0) {
                    tl.setResult(tl.TaskResult.Failed, tl.loc('AwsReturnCode', bash, exitCode));
                }
                else {
                    tl.setResult(tl.TaskResult.Succeeded, tl.loc('AwsReturnCode', bash, exitCode));
                }
                // Fail on stderr.
                if (stderrFailure) {
                    tl.setResult(tl.TaskResult.Failed, tl.loc('AwsReturnCode', bash, exitCode));
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
//# sourceMappingURL=AWSBashTaskOperations.js.map