import { App, Stack, Construct, StackProps } from "@aws-cdk/core";
import { Repository } from "@aws-cdk/aws-codecommit";
import { ServicePrincipal, Effect, ManagedPolicy, PolicyDocument, PolicyStatement, Role } from "@aws-cdk/aws-iam";
import { Repository as EcrRepository } from "@aws-cdk/aws-ecr";
import { IProject, Project, Source, BuildSpec, LinuxBuildImage } from "@aws-cdk/aws-codebuild"
import { RuleTargetInput, EventField } from "@aws-cdk/aws-events";
import * as events from '@aws-cdk/aws-events'
import * as targets from '@aws-cdk/aws-events-targets'

export class AwsPrBuildStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new events.Rule(this, `pr-create`, {
      ruleName: 'pr-created',
      eventPattern: {
        source: ['aws.codecommit'],
        detailType: ['CodeCommit Pull Request State Change'],
        detail: {
          event: ['pullRequestCreated', 'pullRequestSourceBranchUpdated'],
          pullRequestStatus: ['Open']
        },
      },
      targets: [new targets.CodeBuildProject(this.newProject(), {
        event: events.RuleTargetInput.fromObject({
          sourceVersion: EventField.fromPath('$.detail.sourceReference')
        })
      })]
    })
  }

  private newProject(): IProject {
    const repo = Repository.fromRepositoryName(this, "sample-repo", "sample");

    return new Project(this, "pull-request-build", {
      source: Source.codeCommit({ repository: repo }),
      projectName: 'pull-request',
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [              
              'echo ${CODEBUILD_SOURCE_VERSION}',
              'BRANCH_NAME=${CODEBUILD_SOURCE_VERSION##*/}',
              'echo ${BRANCH_NAME}',
              'ls -la'
            ]
          }
        }
      }),
      role: new Role(this, "pull-request-build-role", {
        assumedBy: new ServicePrincipal('codebuild.amazonaws.com')
      })
    })
  }

  
};
