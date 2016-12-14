import React, {Component, PropTypes} from 'react';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import PageHeader from 'react-bootstrap/lib/PageHeader';
import Jumbotron from 'react-bootstrap/lib/Jumbotron';

import BlueprintThumbnail from './BlueprintThumbnail';
import base from '../base';

class FavoritesGrid extends Component {
	static propTypes = {
		user      : PropTypes.shape({
			userId     : PropTypes.string.isRequired,
			displayName: PropTypes.string,
		}),
		blueprints: PropTypes.object.isRequired,
	};

	state = {
		keys: {},
	};

	componentWillReceiveProps(nextProps)
	{
		if (nextProps.user)
		{
			const favoritesRef = base.database().ref(`/users/${nextProps.user.userId}/favorites/`);
			favoritesRef.once('value').then((snapshot) =>
			{
				const keys = snapshot.val();
				this.setState({keys});
			});
		}
		else
		{
			console.log(nextProps);
		}
	}

	render()
	{
		if (!this.props.user)
		{
			return (
				<Jumbotron>
					<h1>{'My Favorites'}</h1>
					<p>{'Please log in with Google, Facebook, Twitter, or GitHub in order to view your favorite blueprints.'}</p>
				</Jumbotron>
			);
		}

		return (
			<Grid>
				<Row>
					<PageHeader>{'Viewing My Favorites'}</PageHeader>
				</Row>
				<Row>
					{
						Object.keys(this.state.keys)
							.filter(key => this.state.keys[key])
							.map(key => <BlueprintThumbnail key={key} id={key} {...this.props.blueprints[key]} />)
					}
				</Row>
			</Grid>
		);
	}
}

export default FavoritesGrid;
