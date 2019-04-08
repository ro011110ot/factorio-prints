import isEmpty from 'lodash/isEmpty';

import {END, eventChannel}       from 'redux-saga';
import {call, put, select, take} from 'redux-saga/effects';
import * as actionTypes          from '../actions/actionTypes';

import {app} from '../base';

export const subscribeToBlueprintSaga = function*({blueprintId})
{
	yield put({type: actionTypes.SUBSCRIBED_TO_BLUEPRINT, blueprintId});
	const response = yield call(fetch, `${process.env.REACT_APP_REST_URL}/api/blueprint/${blueprintId}`);
	if (response.ok)
	{
		const blueprint = yield call(() => response.json());
		yield put({type: actionTypes.RECEIVED_BLUEPRINT, blueprint, blueprintId});
	}
	else
	{
		const error = yield call(() => response.text());
		console.log({error});
		yield put({type: actionTypes.RECEIVED_BLUEPRINT, blueprint: undefined, blueprintId, error});
	}
};

export const subscribeToSummariesSaga = function*()
{
	const getFilteredTags = state => state.filteredTags;
	const getTitleFilter = state => state.titleFilter;
	const getCurrentPage = state => state.blueprintSummaries.currentPage;
	const filteredTags = yield select(getFilteredTags);
	const titleFilter = yield select(getTitleFilter);
	const currentPage = yield select(getCurrentPage);

	yield put({type: actionTypes.SUBSCRIBED_TO_SUMMARIES, filteredTags, titleFilter});

	const urlSearchParams = new URLSearchParams();

	if (!isEmpty(titleFilter))
	{
		urlSearchParams.append('title',  titleFilter);
	}

	if (!isEmpty(filteredTags))
	{
		urlSearchParams.append('tag',  filteredTags);
	}

	try
	{
		const response = yield call(fetch, `${process.env.REACT_APP_REST_URL}/api/blueprintSummaries/filtered/page/${currentPage}?${urlSearchParams.toString()}`);
		const blueprintSummariesEnvelope = yield call(() => response.json());
		yield put({type: actionTypes.RECEIVED_SUMMARIES, blueprintSummariesEnvelope, titleFilter, filteredTags});
	}
	catch (error)
	{
		yield put({type: actionTypes.SUMMARIES_FAILED, titleFilter, filteredTags, error});
	}
};

export const filterTitleSummariesSaga = function*({title})
{
	yield put({type: actionTypes.SAVE_FILTER_ON_TITLE, title});
	yield put({type: actionTypes.FILTERED_ON_TITLE});
};

export const filterTagsSummariesSaga = function*(arg)
{
	console.log({arg});
	const {tags} = arg;

	yield put({type: actionTypes.SAVE_FILTER_ON_TAGS, tags});
	yield put({type: actionTypes.FILTERED_ON_TAGS});
};

export const subscribeToAllFavoritesSaga = function*()
{
	const getFilteredTags = state => state.filteredTags;
	const getTitleFilter = state => state.titleFilter;
	const getCurrentPage = state => state.blueprintAllFavorites.currentPage;
	const filteredTags = yield select(getFilteredTags);
	const titleFilter = yield select(getTitleFilter);
	const currentPage = yield select(getCurrentPage);

	yield put({type: actionTypes.SUBSCRIBED_TO_ALL_FAVORITES, filteredTags, titleFilter});

	const urlSearchParams = new URLSearchParams();

	if (!isEmpty(titleFilter))
	{
		urlSearchParams.append('title',  titleFilter);
	}

	if (!isEmpty(filteredTags))
	{
		urlSearchParams.append('tag',  filteredTags);
	}

	const response = yield call(fetch, `${process.env.REACT_APP_REST_URL}/api/blueprintSummaries/favorite/page/${currentPage}?${urlSearchParams.toString()}`);
	const blueprintAllFavoritesEnvelope = yield call(() => response.json());
	yield put({type: actionTypes.RECEIVED_ALL_FAVORITES, blueprintAllFavoritesEnvelope, titleFilter, filteredTags});
};

export const goToPreviousSummariesSaga = function*()
{
	yield put({type: actionTypes.SAVE_PREVIOUS_SUMMARIES});
	yield put({type: actionTypes.WENT_TO_PREVIOUS_SUMMARIES});
};

export const goToNextSummariesSaga = function*()
{
	yield put({type: actionTypes.SAVE_NEXT_SUMMARIES});
	yield put({type: actionTypes.WENT_TO_NEXT_SUMMARIES});
};

export const goToFirstSummariesSaga = function*()
{
	yield put({type: actionTypes.SAVE_FIRST_SUMMARIES});
	yield put({type: actionTypes.WENT_TO_FIRST_SUMMARIES});
};

export const goToPreviousAllFavoritesSaga = function*()
{
	yield put({type: actionTypes.SAVE_PREVIOUS_ALL_FAVORITES});
	yield put({type: actionTypes.WENT_TO_PREVIOUS_ALL_FAVORITES});
};

export const goToNextAllFavoritesSaga = function*()
{
	yield put({type: actionTypes.SAVE_NEXT_ALL_FAVORITES});
	yield put({type: actionTypes.WENT_TO_NEXT_ALL_FAVORITES});
};

export const goToFirstAllFavoritesSaga = function*()
{
	yield put({type: actionTypes.SAVE_FIRST_ALL_FAVORITES});
	yield put({type: actionTypes.WENT_TO_FIRST_ALL_FAVORITES});
};

export const subscribeToTagsSaga = function*()
{
	const getTags = state => state.tags;
	const tagsState = yield select(getTags);
	if (!isEmpty(tagsState.data))
	{
		return;
	}

		yield put({type: actionTypes.SUBSCRIBED_TO_TAGS});
		const response = yield call(fetch, `${process.env.REACT_APP_REST_URL}/api/tags/`);
		if (response.ok)
		{
			const tagsData = yield call(() => response.json());
			const tags     = tagsData.map(each => `/${each.category}/${each.name}/`);
			yield put({type: actionTypes.RECEIVED_TAGS, tags});
		}
		else
		{
			const error = yield call(() => response.text());
			console.log({error});
			yield put({type: actionTypes.RECEIVED_TAGS, tags: [], error});
		}
};

const moderatorsData = () =>
	eventChannel((emit) =>
	{
		const moderatorsRef = app.database().ref('/moderators/');
		const onValueChange = (dataSnapshot) =>
		{
			const moderators = dataSnapshot.val();
			emit({moderators, moderatorsRef});
		};

		// TODO: Why do I get here twice?
		moderatorsRef.off();
		moderatorsRef.on('value', onValueChange, () => emit(END));

		return () =>
		{
			moderatorsRef.off('value', onValueChange);
		};
	});

export const subscribeToModeratorsSaga = function*()
{
	const getModerators = state => state.moderators;

	const moderatorsState = yield select(getModerators);
	if (isEmpty(moderatorsState.data) || !moderatorsState.moderatorsRef)
	{
		const channel = yield call(moderatorsData);
		yield put({type: actionTypes.SUBSCRIBED_TO_MODERATORS});
		try
		{
			while (true)
			{
				const {moderators, moderatorsRef} = yield take(channel);
				yield put({type: actionTypes.RECEIVED_MODERATORS, moderators, moderatorsRef});
			}
		}
		finally
		{
			console.log('Unsubscribed from moderators');
		}
	}
};

