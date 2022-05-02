import * as cdk from '@aws-cdk/core';
import * as events from '@aws-cdk/aws-events'
import * as targets from '@aws-cdk/aws-events-targets'

export class AwsPrBuildStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    new events.Rule(this, `pr-create`, {
            eventPattern: {
                source: ['aws.codecommit'],
                detailType: ['CodeCommit Pull Request State Change'],
                resources: ['arn:aws:codecommit:us-east-2:657641750194:sample'],
                detail: {
                    event: ['pullRequestCreated', 'pullRequestSourceBranchUpdated'],
                    pullRequestStatus: "Open"
                },
            },
            //targets: [new targets.CodeBuildProject(this)]
        })
  }
}
