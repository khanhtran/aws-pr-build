#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsPrBuildStack } from '../lib/aws-pr-build-stack';

const app = new cdk.App();
const props = {
    env: {
        account: '657641750194',
        region: 'us-east-2'
    }
}
new AwsPrBuildStack(app, 'AwsPrBuildStack', props);


app.synth()