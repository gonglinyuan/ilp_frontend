import React from 'react';
import backend from './backend';

function ContractForm(props) {
    return (
        <div>
            <form onSubmit={props.onSubmit}>
                <div>
                    <label>
                        My Address:
                        <input type="text" value={props.address} onChange={props.onAddressChange}/>
                    </label>
                </div>
                <div>
                    <label>
                        Contract Address:
                        <input type="text" value={props.contractAddress} onChange={props.onContractChange}/>
                    </label>
                </div>
                <div>
                    <input type="submit" value="Get Problem" />
                </div>
            </form>
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
        </div>
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
            solution : newSolution
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
        return (
            <div>
                <h3>Problem</h3>
                <ContractForm address={this.state.address}
                              contractAddress={this.state.contractAddress}
                              deadline={this.state.problem ? this.state.problem.deadline.toString() : ''}
                              bounty={this.state.problem ? this.state.problem.bounty + ' ETH' : ''}
                              onAddressChange={(event) => this.handleAddressChange(event.target.value)}
                              onContractChange={(event) => this.handleContractChange(event.target.value)}
                              onSubmit={this.handleContractSubmit.bind(this)}/>
                <h3>Submit Solution</h3>
                <form>
                    <div>
                        <label>
                            Solution Vector:
                            <input type="text" value={this.state.solution}
                                   onChange={(event) => this.handleSolutionChange(event.target.value)} />
                        </label>
                    </div>
                    <div>
                        <label>
                            Optimal Value:
                            <input type="text" value={this.state.opt}
                                   onChange={(event) => this.handleOptChange(event.target.value)} />
                        </label>
                    </div>
                    <div>
                        <input type="button" value="Commit" onClick={this.handleCommit.bind(this)} />
                        <input type="button" value="Reveal" onClick={this.handleReveal.bind(this)} />
                        <input type="button" value="Claim Reward" onClick={this.handleFinish.bind(this)} />
                    </div>
                </form>
                <div>
                    {
                        this.state.log.map((str) => (
                            <div> {str} </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}

export default Solver;