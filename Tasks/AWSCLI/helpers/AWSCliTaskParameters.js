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
            this.awsCliCommand = tl.getInput('awsCommand', true);
            this.awsCliSubCommand = tl.getInput('awsSubCommand', true);
            this.awsCliParameters = tl.getInput('awsArguments', false);
            this.failOnStandardError = tl.getBoolInput('failOnStandardError');
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
}
exports.TaskParameters = TaskParameters;
//# sourceMappingURL=AWSCliTaskParameters.js.map