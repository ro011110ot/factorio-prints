import {faCog}                from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon}      from '@fortawesome/react-fontawesome';
import {forbidExtraProps}     from 'airbnb-prop-types';
import isUndefined            from 'lodash/isUndefined';
import PropTypes              from 'prop-types';
import React, {PureComponent} from 'react';
import Grid                   from 'react-bootstrap/lib/Grid';
import Jumbotron              from 'react-bootstrap/lib/Jumbotron';
import PageHeader             from 'react-bootstrap/lib/PageHeader';
import Row                    from 'react-bootstrap/lib/Row';
import {connect}              from 'react-redux';
import {bindActionCreators}   from 'redux';

import {filterOnTags, subscribeToUser} from '../actions/actionCreators';

import * as propTypes from '../propTypes';
import * as selectors from '../selectors';

import BlueprintThumbnail from './BlueprintThumbnail';
import NoMatch            from './NoMatch';
import SearchForm         from './SearchForm';
import TagForm            from './TagForm';

class UserGrid extends PureComponent
{
	static propTypes = forbidExtraProps({
		id                       : PropTypes.string.isRequired,
		displayName              : PropTypes.string,
		displayNameLoading       : PropTypes.bool.isRequired,
		subscribeToUser          : PropTypes.func.isRequired,
		filterOnTags             : PropTypes.func.isRequired,
		user                     : propTypes.userSchema,
		blueprintSummaries       : propTypes.blueprintSummariesSchema,
		blueprintSummariesLoading: PropTypes.bool,
		location                 : propTypes.locationSchema,
		history                  : PropTypes.object.isRequired,
		staticContext            : PropTypes.shape(forbidExtraProps({})),
		match                    : PropTypes.shape(forbidExtraProps({
			params: PropTypes.shape(forbidExtraProps({
				userId: PropTypes.string.isRequired,
			})).isRequired,
			path   : PropTypes.string.isRequired,
			url    : PropTypes.string.isRequired,
			isExact: PropTypes.bool.isRequired,
		})).isRequired,

	});

	componentWillMount()
	{
		// Logged in user
		if (this.props.user)
		{
			this.props.subscribeToUser(this.props.user.uid);
		}
		// Blueprint author
		this.props.subscribeToUser(this.props.id);
	}

	render()
	{
		if (this.props.blueprintSummariesLoading && (this.props.userBlueprintsLoading || this.props.displayNameLoading || this.props.blueprintSummariesLoading))
		{
			return (
				<Jumbotron>
					<h1>
						<FontAwesomeIcon icon={faCog} spin />
						{' Loading data'}
					</h1>
				</Jumbotron>
			);
		}

		if (isUndefined(this.props.blueprintSummaries))
		{
			return <NoMatch />;
		}

		return (
			<Grid>
				<Row>
					<PageHeader>
						{'Viewing Blueprints by '}{this.props.displayName || '(Anonymous)'}
					</PageHeader>
				</Row>
				<Row>
					<SearchForm />
					<TagForm />
				</Row>
				<Row>
					{
						this.props.blueprintSummaries.map(blueprintSummary =>
							<BlueprintThumbnail key={blueprintSummary.key} blueprintSummary={blueprintSummary} />)
					}
				</Row>
			</Grid>
		);
	}
}

const mapStateToProps = (storeState, ownProps) =>
{
	const id = ownProps.match.params.userId;
	return {
		id,
		user                     : selectors.getFilteredUser(storeState),
		blueprintSummaries       : selectors.getUserFilteredBlueprintSummaries(storeState, {id}),
		blueprintSummariesLoading: selectors.getUserBlueprintsLoading(storeState, {id}),
		displayName              : selectors.getUserDisplayName(storeState, {id}),
		displayNameLoading       : selectors.getUserDisplayNameLoading(storeState, {id}),
	};
};

const mapDispatchToProps = (dispatch) =>
{
	const actionCreators = {
		filterOnTags,
		subscribeToUser,
	};
	return bindActionCreators(actionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(UserGrid);
