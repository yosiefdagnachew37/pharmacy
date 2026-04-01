import { SetMetadata } from '@nestjs/common';
import { SystemFeature } from '../enums/system-feature.enum';

export const REQUIRE_FEATURE_KEY = 'required_feature';
export const RequireFeature = (...features: SystemFeature[]) => SetMetadata(REQUIRE_FEATURE_KEY, features);
