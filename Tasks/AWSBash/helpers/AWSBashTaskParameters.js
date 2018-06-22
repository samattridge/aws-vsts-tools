"use strict";
/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("vsts-task-lib/task");
const sdkutils = require("sdkutils/sdkutils");
class TaskParameters extends sdkutils.AWSTaskParametersBase {
    constructor() {
        super();
        try {
            this.workingDirectory = tl.getPathInput('workingDirectory', /*required*/ true, /*check*/ true);
            this.targetType = tl.getInput('targetType') || '';
            this.failOnStderr = tl.getBoolInput('failOnStderr', false);
            if (this.targetType.toUpperCase() == 'FILEPATH') {
                this.filePath = tl.getPathInput('filePath', /*required*/ true);
                if (!tl.stats(this.filePath).isFile()) {
                    throw new Error(tl.loc('JS_InvalidFilePath', this.filePath));
                }
                this.arguments = tl.getInput('arguments') || '';
            }
            else {
                this.script = tl.getInput('script', false) || '';
            }
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
}
exports.TaskParameters = TaskParameters;
//# sourceMappingURL=AWSBashTaskParameters.js.map