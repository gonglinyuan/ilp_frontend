import React from 'react';
import backend from './backend';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
    paper: {
        padding: theme.spacing.unit * 2
    },
});

function ContractForm(props) {
    return (
        <Grid item>
            <Paper className={props.classes.paper}>
                <form onSubmit={props.onSubmit}>
                    <div>
                        <label>
                            My Address:
                            <TextField required className="TextField" value={props.address}
                                       onChange={props.onAddressChange}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            Contract Address:
                            <TextField required className="TextField" value={props.contractAddress}
                                       onChange={props.onContractChange}/>
                        </label>
                    </div>
                    <div>
                        <Button color="primary" type="submit">
                            Get Problem
                        </Button>
                    </div>
                </form>
                <Divider variant="middle"/>
                <div>
                    <p>
                        Maximize:
                    </p>
                    <p>
                        Subject to:
                    </p>
                    <ul>

                    </ul>
                    <p>
                        Deadline: {props.deadline}
                    </p>
                    <p>
                        Bounty: {props.bounty}
                    </p>
                </div>
            </Paper>
        </Grid>
    )
}

class Solver extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: '',
            contractAddress: '',
            problem: null,
            solution: '',
            opt: '',
            nonce: '',
            log: []
        };
    }

    handleAddressChange(newAddress) {
        this.setState({
            address: newAddress
        });
    }

    handleContractChange(newContractAddress) {
        this.setState({
            contractAddress: newContractAddress
        });
    }

    handleContractSubmit(event) {
        backend.getDesription(this.state.address, this.state.contractAddress, (problem) => {
            this.setState({
                problem: problem
            });
        });
        event.preventDefault();
    }

    handleSolutionChange(newSolution) {
        this.setState({
            solution: newSolution
        });
    }

    handleOptChange(newOpt) {
        this.setState({
            opt: newOpt
        })
    }

    handleCommit(event) {
        var nonce = new Uint32Array(2);
        crypto.getRandomValues(nonce);
        nonce = '0x' + nonce[0].toString(16) + nonce[1].toString(16);
        this.setState({
            nonce: nonce
        });
        backend.commitSolution(
            this.state.address,
            this.state.contractAddress,
            JSON.parse(this.state.solution),
            nonce,
            parseInt(this.state.opt),
            (count, receipt) => {
                this.setState({
                    log: this.state.log.concat(["Confirm count: " + count.toString()])
                });
            }
        )
    }

    handleReveal(event) {
        backend.revealSolution(
            this.state.address,
            this.state.contractAddress,
            JSON.parse(this.state.solution),
            this.state.nonce
        )
    }

    handleFinish(event) {
        backend.claimReward(this.state.address, this.state.contractAddress);
    }

    render() {
        const { classes } = this.props;
        return (
            <Grid container spacing={16}>
                <ContractForm classes={classes}
                              address={this.state.address}
                              contractAddress={this.state.contractAddress}
                              deadline={this.state.problem ? this.state.problem.deadline.toString() : ''}
                              bounty={this.state.problem ? this.state.problem.bounty + ' ETH' : ''}
                              onAddressChange={(event) => this.handleAddressChange(event.target.value)}
                              onContractChange={(event) => this.handleContractChange(event.target.value)}
                              onSubmit={this.handleContractSubmit.bind(this)}/>

                <Grid item>
                    <Paper className={classes.paper}>
                        <form>
                            <div>
                                <label>
                                    Solution Vector:
                                    <TextField required className="TextField" value={this.state.solution}
                                               onChange={(event) => this.handleSolutionChange(event.target.value)}/>
                                </label>
                            </div>
                            <div>
                                <label>
                                    Optimal Value:
                                    <TextField required className="TextField" value={this.state.opt}
                                               onChange={(event) => this.handleOptChange(event.target.value)}/>
                                </label>
                            </div>
                            <div>
                                {/*<input type="button" value="Commit"  />*/}
                                <Button color="primary" onClick={this.handleCommit.bind(this)}>
                                    Commit
                                </Button>
                                <Button color="primary" onClick={this.handleReveal.bind(this)}>
                                    Reveal
                                </Button>
                                <Button color="primary" onClick={this.handleFinish.bind(this)}>
                                    Claim Reward
                                </Button>
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

export default withStyles(styles)(Solver);