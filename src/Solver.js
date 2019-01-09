import React, {Component} from 'react';
import moment from "moment";
import backend from './backend';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Parser from './Parser'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const parser = new Parser();
const creatorContractAddress = '0x9c17a92FCF7D356AE470832FB958121149Ae98c0';

const styles = theme => ({
    paper: {
        padding: theme.spacing.unit * 2
    },
});

class LoginFrom extends Component {
    render() {
        if (this.props.loggedIn) {
            return (
                <Grid item xs={12}>
                    <Paper className={this.props.classes.paper}>
                        <form onSubmit={this.props.onSubmit}>
                            <div>
                                <TextField required className="TextField" value={this.props.address} label="Address"
                                           readOnly/>
                            </div>
                            <div>
                                <TextField required className="TextField" value={this.props.balance} label="Balance"
                                           readOnly/>
                            </div>
                        </form>
                    </Paper>
                </Grid>
            )
        } else {
            return (
                <Grid item xs={12}>
                    <Paper className={this.props.classes.paper}>
                        <form onSubmit={this.props.onSubmit}>
                            <div>
                                <TextField required className="TextField" value={this.props.address} label="Address"
                                           onChange={this.props.onAddressChange}/>
                            </div>
                            <div>
                                <Button color="primary" type="submit">
                                    Login
                                </Button>
                            </div>
                        </form>
                    </Paper>
                </Grid>
            )
        }

    }
}

class ProblemList extends Component {
    renderProblem(problem, i) {
        return (
            <TableRow>
                <TableCell>{problem.address}</TableCell>
                <TableCell align="right">{problem.n}</TableCell>
                <TableCell align="right">{problem.m}</TableCell>
                <TableCell align="right">{problem.bounty + ' ETH'}</TableCell>
                <TableCell align="right">{moment.unix(problem.deadline).fromNow()}</TableCell>
                <TableCell>
                    <Button color="primary" onClick={(event) => this.props.onSubmit(i)}>
                        Show
                    </Button>
                </TableCell>
            </TableRow>
        )
    }

    render() {
        var problemsHTML = [];
        for (let i = 0; i < this.props.problemList.length; ++i) {
            problemsHTML.push(this.renderProblem(this.props.problemList[i], i));
        }
        problemsHTML = problemsHTML.sort((obj1, obj2) => (obj1.deadline - obj2.deadline));
        return (
            <Grid item xs={12}>
                <Paper className={this.props.classes.paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Address</TableCell>
                                <TableCell align="right"># Variables</TableCell>
                                <TableCell align="right"># Constraints</TableCell>
                                <TableCell align="right">Bounty</TableCell>
                                <TableCell align="right">Deadline</TableCell>
                                <TableCell/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {problemsHTML}
                        </TableBody>
                    </Table>
                </Paper>
            </Grid>
        )
    }
}

class ContractForm extends Component {
    renderConstraint(i) {
        return (
            <p>{this.props.constraints[i]}</p>
        )
    }

    render() {
        var constraintsHTML = [];
        for (let i = 0; i < this.props.constraints.length; ++i) {
            constraintsHTML.push(this.renderConstraint(i));
        }
        return (
            <Grid item xs={12}>
                <Paper className={this.props.classes.paper}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    Maximize
                                </TableCell>
                                <TableCell align="right">
                                    {this.props.objective}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    Subject to
                                </TableCell>
                                <TableCell align="right">
                                    {constraintsHTML}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    Deadline
                                </TableCell>
                                <TableCell align="right">
                                    {this.props.deadline}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    Bounty (Left)
                                </TableCell>
                                <TableCell align="right">
                                    {this.props.bounty + ' ETH'}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Paper>
            </Grid>
        )
    }
}

class Solver extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: '',
            loggedIn: false,
            balance: '',
            problemList: [],
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

    handleLoginSubmit(event) {
        if (backend.isValidAddress(this.state.address)) {
            backend.getBalance(this.state.address).then((function (newBalance) {
                this.setState({
                    balance: newBalance,
                    loggedIn: true
                });
            }).bind(this));
            backend.getProblemList(this.state.address, creatorContractAddress, (function (problemList) {
                this.setState({
                    problemList: problemList
                });
            }).bind(this));
        }
        event.preventDefault();
    }

    handleProblemShowSubmit(i) {
        console.log(this);
        console.log(this.state.address);
        console.log(this.state.problemList);
        console.log(i);
        backend.getDesription(this.state.address, this.state.problemList[i].address, (problem) => {
            this.setState({
                problem: problem,
                contractAddress: this.state.problemList[i].address
            });
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
        var nonce;
        if (this.state.nonce === '') {
            nonce = new Uint32Array(2);
            crypto.getRandomValues(nonce);
            nonce = '0x' + nonce[0].toString(16) + nonce[1].toString(16);
            this.setState({
                nonce: nonce
            });
        } else {
            nonce = this.state.nonce;
        }
        backend.revealSolution(
            this.state.address,
            this.state.contractAddress,
            JSON.parse(this.state.solution),
            nonce,
            parseInt(this.state.opt)
        )
    }

    handleFinish(event) {
        backend.claimReward(this.state.address, this.state.contractAddress);
    }

    render() {
        const {classes} = this.props;
        if (this.state.loggedIn) {
            let parsed = this.state.problem ? parser.reverseParseObject(
                this.state.problem.n, this.state.problem.m,
                this.state.problem.a, this.state.problem.b, this.state.problem.c
            ) : {
                objective: '',
                constraints: []
            };
            console.log(parsed);
            return (
                <Grid container spacing={16}>
                    <LoginFrom classes={this.props.classes}
                               address={this.state.address}
                               balance={this.state.balance}
                               loggedIn={this.state.loggedIn}
                               onAddressChange={(event) => this.handleAddressChange(event.target.value)}
                               onSubmit={this.handleLoginSubmit.bind(this)}/>
                    <ProblemList classes={classes}
                                 problemList={this.state.problemList}
                                 onSubmit={this.handleProblemShowSubmit.bind(this)}/>
                    <ContractForm classes={classes}
                                  address={this.state.address}
                                  contractAddress={this.state.contractAddress}
                                  deadline={this.state.problem ? moment(this.state.problem.deadline).format("YYYY-MM-DD HH:mm:ss") : ''}
                                  objective={parsed.objective}
                                  constraints={parsed.constraints}
                                  bounty={this.state.problem ? this.state.problem.bounty + ' ETH' : ''}
                                  onAddressChange={(event) => this.handleAddressChange(event.target.value)}
                                  onContractChange={(event) => this.handleContractChange(event.target.value)}
                                  onSubmit={this.handleContractSubmit.bind(this)}/>

                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <form>
                                <div>
                                    <TextField required className="TextField" value={this.state.solution}
                                               label="Solution Vector"
                                               onChange={(event) => this.handleSolutionChange(event.target.value)}/>
                                </div>
                                <div>
                                    <TextField required className="TextField"
                                               value={this.state.opt} label="Optimal Value"
                                               onChange={(event) => this.handleOptChange(event.target.value)}/>
                                </div>
                                <div>
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
        } else {
            return (
                <Grid container spacing={16}>
                    <LoginFrom classes={this.props.classes}
                               address={this.state.address}
                               balance={this.state.balance}
                               loggedIn={this.state.loggedIn}
                               onAddressChange={(event) => this.handleAddressChange(event.target.value)}
                               onSubmit={this.handleLoginSubmit.bind(this)}/>
                </Grid>
            );
        }
    }
}

export default withStyles(styles)(Solver);