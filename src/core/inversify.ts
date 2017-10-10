import { Container } from 'inversify';

import { Configuration } from 'core/config';
import { Db } from 'core/db';
import { Logger } from 'core/log';
import { PassportConfiguration } from 'core/passport';
import { Policy } from 'core/policy';

import { AuthService } from 'services/auth.service';
import { ResponseService } from 'services/response.service';

import { UserFactory } from 'models/user.model';
import { TokenFactory } from 'models/token.model';
import { ShowFactory } from 'models/show.model';
import { SeasonFactory } from 'models/season.model';
import { EpisodeFactory } from 'models/episode.model';

import { ApiShowFactory } from 'models/external/show.model';

import { UserRoute } from 'api/endpoints/user/user.route';
import { ShowRoute } from 'api/endpoints/show/show.route';

import { UserController } from 'api/endpoints/user/user.controller';
import { ShowController } from 'api/endpoints/show/show.controller';

import { UserValidator } from 'api/endpoints/user/user.validator';
import { ShowValidator } from 'api/endpoints/show/show.validator';

import { Api } from 'api/api';
import { RouterFactory } from 'api/router';

export let InversifyContainer = new Container();

InversifyContainer.bind<Configuration>(Configuration).toSelf().inSingletonScope();
InversifyContainer.bind<Db>(Db).toSelf().inSingletonScope();
InversifyContainer.bind<Logger>(Logger).toSelf().inSingletonScope();

InversifyContainer.bind<PassportConfiguration>(PassportConfiguration).toSelf();
InversifyContainer.bind<Policy>(Policy).toSelf();

InversifyContainer.bind<AuthService>(AuthService).toSelf();
InversifyContainer.bind<ResponseService>(ResponseService).toSelf();

InversifyContainer.bind<UserFactory>(UserFactory).toSelf();
InversifyContainer.bind<TokenFactory>(TokenFactory).toSelf();
InversifyContainer.bind<ShowFactory>(ShowFactory).toSelf();
InversifyContainer.bind<SeasonFactory>(SeasonFactory).toSelf();
InversifyContainer.bind<EpisodeFactory>(EpisodeFactory).toSelf();

InversifyContainer.bind<ApiShowFactory>(ApiShowFactory).toSelf();

InversifyContainer.bind<UserRoute>(UserRoute).toSelf();
InversifyContainer.bind<ShowRoute>(ShowRoute).toSelf();

InversifyContainer.bind<UserController>(UserController).toSelf();
InversifyContainer.bind<ShowController>(ShowController).toSelf();

InversifyContainer.bind<UserValidator>(UserValidator).toSelf();
InversifyContainer.bind<ShowValidator>(ShowValidator).toSelf();

InversifyContainer.bind<Api>(Api).toSelf();
InversifyContainer.bind<RouterFactory>(RouterFactory).toSelf();
