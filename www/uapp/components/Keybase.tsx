/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as SuperAgent from 'superagent';
import * as Csrf from '../Csrf';
import * as Alert from '../Alert';
import Session from './Session';

interface Props {
	token: string;
	signature: string;
}

interface State {
	disabled: boolean;
	answered: boolean;
}

const css = {
	body: {
		padding: '0 10px',
	} as React.CSSProperties,
	description: {
		opacity: 0.7,
	} as React.CSSProperties,
	buttons: {
		marginTop: '15px',
	} as React.CSSProperties,
	button: {
		margin: '5px',
		width: '116px',
	} as React.CSSProperties,
};

export default class Validate extends React.Component<Props, State> {
	constructor(props: any, context: any) {
		super(props, context);
		this.state = {
			disabled: false,
			answered: false,
		};
	}

	render(): JSX.Element {
		if (this.state.answered) {
			return <Session/>;
		}

		return <div>
			<div className="pt-non-ideal-state" style={css.body}>
				<div className="pt-non-ideal-state-visual pt-non-ideal-state-icon">
					<span className="pt-icon pt-icon-endorsed"/>
				</div>
				<h4 className="pt-non-ideal-state-title">Associate Keybase Account</h4>
				<span style={css.description}>If you did not initiate this association deny the request and report the incident to an administrator</span>
			</div>
			<div className="layout horizontal center-justified" style={css.buttons}>
				<button
					className="pt-button pt-large pt-intent-success pt-icon-add"
					style={css.button}
					type="button"
					disabled={this.state.disabled}
					onClick={(): void => {
						this.setState({
							...this.state,
							disabled: true,
						});

						SuperAgent
							.put('/keybase/validate')
							.set('Accept', 'application/json')
							.set('Csrf-Token', Csrf.token)
							.send({
								token: this.props.token,
								signature: this.props.signature,
							})
							.end((err: any, res: SuperAgent.Response): void => {
								this.setState({
									...this.state,
									disabled: false,
								});

								if (res.status === 404) {
									Alert.error('Keybase association request has expired', 0);
								} else if (err) {
									Alert.errorRes(res, 'Failed to associate keybase', 0);
								} else {
									Alert.success('Successfully associated keybase', 0);
								}

								this.setState({
									...this.state,
									answered: true,
								});

								window.history.replaceState(
									null, null, window.location.pathname);
							});
					}}
				>
					Approve
				</button>
				<button
					className="pt-button pt-large pt-intent-danger pt-icon-delete"
					style={css.button}
					type="button"
					disabled={this.state.disabled}
					onClick={(): void => {
						this.setState({
							...this.state,
							disabled: true,
						});

						SuperAgent
							.delete('/keybase/validate')
							.set('Accept', 'application/json')
							.set('Csrf-Token', Csrf.token)
							.send({
								token: this.props.token,
								signature: this.props.signature,
							})
							.end((err: any, res: SuperAgent.Response): void => {
								this.setState({
									...this.state,
									disabled: false,
								});

								if (res.status === 404) {
									Alert.error('Keybase association request has expired', 0);
								} else if (err) {
									Alert.errorRes(res,
										'Failed to deny keybase association', 0);
									return;
								} else {
									Alert.error('Successfully denied keybase association. ' +
										'Report this incident to an administrator.', 0);
								}

								this.setState({
									...this.state,
									answered: true,
								});

								window.history.replaceState(
									null, null, window.location.pathname);
							});
					}}
				>
					Deny
				</button>
			</div>
		</div>;
	}
}