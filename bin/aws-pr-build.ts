#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsPrBuildStack } from '../lib/aws-pr-build-stack';

const app = new cdk.App();
new AwsPrBuildStack(app, 'AwsPrBuildStack', {
});