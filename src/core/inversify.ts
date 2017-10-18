import { Container } from 'inversify';

import { Configuration } from 'core/config';
import { Db } from 'core/db';
import { ImageProvider } from 'core/image';
import { Logger } from 'core/log';
import { PassportConfiguration } from 'core/passport';
import { Policy } from 'core/policy';

import { AuthService } from 'services/auth.service';
import { ExternalService } from 'services/external.service';
import { ResponseService } from 'services/response.service';

import { ApiShowFactory } from 'models/external/show.model';

import { ShowRoute } from 'api/endpoints/show/show.route';
import { UserRoute } from 'api/endpoints/user/user.route';

import { ShowController } from 'api/endpoints/show/show.controller';
import { UserController } from 'api/endpoints/user/user.controller';

import { ShowValidator } from 'api/endpoints/show/show.validator';
import { UserValidator } from 'api/endpoints/user/user.validator';

import { Api } from 'api/api';
import { RouterFactory } from 'api/router';

// tslint:disable-next-line:variable-name
export const InversifyContainer = new Container();

InversifyContainer.bind<Configuration>(Configuration).toSelf().inSingletonScope();
InversifyContainer.bind<Db>(Db).toSelf().inSingletonScope();
InversifyContainer.bind<Logger>(Logger).toSelf().inSingletonScope();
InversifyContainer.bind<ImageProvider>(ImageProvider).toSelf().inSingletonScope();

InversifyContainer.bind<PassportConfiguration>(PassportConfiguration).toSelf();
InversifyContainer.bind<Policy>(Policy).toSelf();

InversifyContainer.bind<AuthService>(AuthService).toSelf();
InversifyContainer.bind<ResponseService>(ResponseService).toSelf();
InversifyContainer.bind<ExternalService>(ExternalService).toSelf();

InversifyContainer.bind<ApiShowFactory>(ApiShowFactory).toSelf();

InversifyContainer.bind<UserRoute>(UserRoute).toSelf();
InversifyContainer.bind<ShowRoute>(ShowRoute).toSelf();

InversifyContainer.bind<UserController>(UserController).toSelf();
InversifyContainer.bind<ShowController>(ShowController).toSelf();

InversifyContainer.bind<UserValidator>(UserValidator).toSelf();
InversifyContainer.bind<ShowValidator>(ShowValidator).toSelf();

InversifyContainer.bind<Api>(Api).toSelf();
InversifyContainer.bind<RouterFactory>(RouterFactory).toSelf();
