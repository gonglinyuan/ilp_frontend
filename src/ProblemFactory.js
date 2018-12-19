import React from 'react';
import backend from './backend'
import moment from 'moment'
import Parser from './Parser'
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const parser = new Parser();

const styles = theme => ({
    paper: {
        padding: theme.spacing.unit
    },
});

function Constraint(props) {
    return (
        <div>
            <TextField required value={props.value} onChange={props.onChange} />
        </div>
    );
}

class Wallet extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            balance : ''
        };
    }

    handleAddressChange(newAddress) {
        backend.getBalance(newAddress).then((function (newBalance) {
            this.setState({
                balance: newBalance
            });
        }).bind(this));
        this.props.onAddressChange(newAddress);
    }

    render() {
        return (
            <div className={this.props.classes.paper}>
                <Typography variant="h6" gutterBottom>
                    Wallet
                </Typography>
                    <div>
                            <TextField value={this.props.address} label="Address"
                                       onChange={(event) => this.handleAddressChange(event.target.value)}/>
                    </div>
                    <div>
                        <TextField value={this.state.balance ? this.state.balance + " ETH" : ''}
                                   label="Balance" readonly />
                    </div>
                    <div>
                            <TextField max={this.state.balance} value={this.props.bounty} label="Bounty"
                                       onChange={(event) => this.props.onBountyChange(event.target.value)}/>
                    </div>
            </div>
        )
    }
}

class ProblemFactory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            objective: '',
            constraints: [],
            address: '',
            bounty: '',
            time: '00:00',
            log: []
        };
    }

    handleObjectiveChange(value) {
        this.setState({
            objective: value
        });
    }

    handleConstraintChange(i, value) {
        const newConstraints = this.state.constraints.slice();
        newConstraints[i] = value;
        this.setState({
            constraints: newConstraints
        });
    }

    handleClick() {
        this.setState({
            constraints: this.state.constraints.concat([''])
        });
    }

    handleAddressChange(newAddress) {
        this.setState({
            address: newAddress
        });
    }

    handleBountyChange(newBounty) {
        this.setState({
            bounty: newBounty
        });
    }

    handleTimeChange(newTime) {
        this.setState({
            time: newTime
        });
    }

    handleSubmit(event) {
        console.log(this.state);
        var problem = parser.parseObject(this.state);
        problem.time = moment.duration(this.state.time).asSeconds();
        console.log(problem);
        backend.submitProblem(this.state.address, problem, this.state.bounty, (receipt) => {
            this.setState({
                log: this.state.log.concat(["Contract created: " + receipt.contractAddress])
            });
        });
        event.preventDefault();
    }

    renderConstraint(i) {
        return (
            <Constraint key={i.toString()} value={this.state.constraints[i]}
                        onChange={(event) => this.handleConstraintChange(i, event.target.value)}/>
        );
    }

    render() {
        const { classes } = this.props;
        let constraintsHTML = [];
        for (let i = 0; i < this.state.constraints.length; ++i) {
            constraintsHTML.push(this.renderConstraint(i));
        }
        return (
            <Grid container spacing={16}>
                <Grid item>
            <Paper className={classes.paper}>
                <form onSubmit={(event) => this.handleSubmit(event)}>
                    <div className={classes.paper}>
                        <Typography variant="h6" gutterBottom>
                            Problem
                        </Typography>
                        <div>
                                <TextField value={this.state.objective} label="Objective"
                                           onChange={(event) => this.handleObjectiveChange(event.target.value)}/>
                        </div>
                        <div>
                            <label>
                                Subject To:
                                <Button color="primary" onClick={() => this.handleClick()}>
                                    Add
                                </Button>
                            </label>
                        </div>

                        {constraintsHTML}
                    </div>

                    <Divider variant="middle"/>

                    <Wallet address={this.state.address} bounty={this.state.bounty}
                            onAddressChange={this.handleAddressChange.bind(this)}
                            onBountyChange={this.handleBountyChange.bind(this)}
                            classes={classes}/>

                    <Divider variant="middle"/>
                    <div className={classes.paper}>
                    <div>
                        <label>Time:</label>
                        <input type="time" value={this.state.time} min="00:00"
                               onChange={(event) => this.handleTimeChange(event.target.value)}/>
                    </div>

                    <div>
                        <Button color="primary" type="submit">
                            Submit
                        </Button>
                    </div>
                    </div>
                </form>

            </Paper>
                </Grid>
                <div>
                    {
                        this.state.log.map((str) => (
                            <div> {str} </div>
                        ))
                    }
                </div>
            </Grid>
        );
    }
}

export default withStyles(styles)(ProblemFactory);