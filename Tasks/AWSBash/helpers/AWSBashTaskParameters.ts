/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import sdkutils = require('sdkutils/sdkutils');

export class TaskParameters extends sdkutils.AWSTaskParametersBase {
    public workingDirectory: string;
    public filePath: string;
    public arguments: string;
    public script: string;
    public targetType: string;
    public failOnStderr: boolean;

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
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
