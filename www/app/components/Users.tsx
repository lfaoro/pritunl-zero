/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as ReactRouter from 'react-router-dom';
import * as UserTypes from '../types/UserTypes';
import UsersStore from '../stores/UsersStore';
import * as UserActions from '../actions/UserActions';
import User from './User';
import Page from './Page';
import PageHeader from './PageHeader';

type Selected = {[key: string]: boolean};

interface State {
	users: UserTypes.Users;
	selected: Selected;
	disabled: boolean;
}

const css = {
	users: {
		width: '100%',
		marginTop: '-5px',
		display: 'table',
		borderSpacing: '0 5px',
	} as React.CSSProperties,
	button: {
		marginLeft: '10px',
	} as React.CSSProperties,
};

export default class Users extends React.Component<{}, State> {
	constructor(props: any, context: any) {
		super(props, context);
		this.state = {
			users: UsersStore.users,
			selected: {},
			disabled: false,
		};
	}

	get selected(): boolean {
		for (let val in this.state.selected) {
			if (this.state.selected[val]) {
				return true;
			}
		}
		return false;
	}

	componentDidMount(): void {
		UsersStore.addChangeListener(this.onChange);
		UserActions.sync();
	}

	componentWillUnmount(): void {
		UsersStore.removeChangeListener(this.onChange);
	}

	onChange = (): void => {
		let users = UsersStore.users;
		let selected = {} as Selected;
		let curSelected = this.state.selected;

		for (let user of users) {
			if (curSelected[user.id]) {
				selected[user.id] = true;
			}
		}

		this.setState({
			...this.state,
			users: users,
			selected: selected,
		});
	}

	onDelete = (): void => {
		this.setState({
			...this.state,
			disabled: true,
		});
		UserActions.remove(Object.keys(this.state.selected)).then((): void => {
			this.setState({
				...this.state,
				selected: {},
				disabled: false,
			});
		}).catch((): void => {
			this.setState({
				...this.state,
				disabled: false,
			});
		});
	}

	render(): JSX.Element {
		let usersDom: JSX.Element[] = [];

		for (let user of this.state.users) {
			usersDom.push(<User
				key={user.id}
				user={user}
				selected={!!this.state.selected[user.id]}
				onSelect={(): void => {
					let selected = this.state.selected;

					if (selected[user.id]) {
						delete selected[user.id];
					} else {
						selected[user.id] = true;
					}

					this.setState({
						...this.state,
						selected: selected,
					});
				}}
			/>)
		}

		return <Page>
			<PageHeader>
				<div className="layout horizontal">
					<h2>Users</h2>
					<div className="flex"/>
					<div>
						<button
							className="pt-button pt-intent-danger pt-icon-delete"
							style={css.button}
							type="button"
							disabled={!this.selected || this.state.disabled}
							onClick={this.onDelete}
						>
							Delete Selected
						</button>
						<ReactRouter.Link
							className="pt-button pt-intent-success pt-icon-add"
							style={css.button}
							to="/user"
						>
							New
						</ReactRouter.Link>
					</div>
				</div>
			</PageHeader>
			<div style={css.users}>
				{usersDom}
			</div>
		</Page>;
	}
}
