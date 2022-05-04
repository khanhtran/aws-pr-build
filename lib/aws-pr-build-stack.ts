import { App, Stack, Construct, StackProps } from "@aws-cdk/core";
import { IRepository, Repository } from "@aws-cdk/aws-codecommit";
import { ServicePrincipal, Effect, ManagedPolicy, PolicyDocument, PolicyStatement, Role } from "@aws-cdk/aws-iam";
import { IProject, Project, Source, BuildSpec, LinuxBuildImage } from "@aws-cdk/aws-codebuild"
import { RuleTargetInput, EventField } from "@aws-cdk/aws-events";
import * as events from '@aws-cdk/aws-events'
import * as targets from '@aws-cdk/aws-events-targets'

export class AwsPrBuildStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    const repo: IRepository = Repository.fromRepositoryName(this, "sample-repo", "sample");
    new events.Rule(this, `pr-create`, {
      ruleName: 'pr-created',
      eventPattern: {
        source: ['aws.codecommit'],
        detailType: ['CodeCommit Pull Request State Change'],
        resources: [repo.repositoryArn],
        detail: {
          event: ['pullRequestCreated', 'pullRequestSourceBranchUpdated'],
          pullRequestStatus: ['Open']
        },
      },
      targets: [new targets.CodeBuildProject(this.newProject(repo), {
        event: events.RuleTargetInput.fromObject({
          sourceVersion: EventField.fromPath('$.detail.sourceReference')
        })
      })]
    })
  }

  private newProject(repo: IRepository): IProject {
    

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
              'git config --global user.email "kxt1979@hotmail.com"',
              'git config --global user.name "Khanh Tran"',
              'git merge origin/master',
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
