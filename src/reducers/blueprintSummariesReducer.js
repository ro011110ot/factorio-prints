import {
	RECEIVED_SUMMARIES,
	SUBSCRIBED_TO_SUMMARIES,
} from '../actions/actionTypes';

const initialState = {
	currentPage: 1,
	isLastPage : false,
	loading    : false,
	data       : [],
	paginator  : undefined,
};

const blueprintSummariesReducer = (state = initialState, action) =>
{
	switch (action.type)
	{
		case RECEIVED_SUMMARIES:
		{
			const {paginator, paginator: {currentPage, isLastPage, loading, data}} = action;
			return {
				...state,
				paginator,
				currentPage,
				isLastPage,
				loading,
				data,
			};
		}
		case SUBSCRIBED_TO_SUMMARIES:
			return {
				...state,
				loading: true,
			};
		default:
			return state;
	}
};

export default blueprintSummariesReducer;
