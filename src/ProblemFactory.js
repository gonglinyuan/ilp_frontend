import React from 'react';
import backend from './backend'
import moment from 'moment'
import Parser from './Parser'

const parser = new Parser();

function Constraint(props) {
    return (
        <div>
            <input className="Constraint" type="text" value={props.value} onChange={props.onChange}/>
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
            <div>
                <h3>Wallet</h3>
                <div>
                    <label>
                        Address:
                        <input className="Wallet" type="text" value={this.props.address}
                               onChange={(event) => this.handleAddressChange(event.target.value)}/>
                    </label>
                </div>
                <div>
                    <label>
                        Balance: {this.state.balance} ETH
                    </label>
                </div>
                <div>
                    <label>
                        Bounty:
                        <input className="Wallet" type="text" max={this.state.balance} value={this.props.bounty}
                               onChange={(event) => this.props.onBountyChange(event.target.value)}/>
                         ETH
                    </label>
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
            bounty: '0',
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
        let constraintsHTML = [];
        for (let i = 0; i < this.state.constraints.length; ++i) {
            constraintsHTML.push(this.renderConstraint(i));
        }
        return (
            <div>
                <form onSubmit={(event) => this.handleSubmit(event)}>
                    <div>
                        <h3>Problem</h3>
                        <div>
                            <label>
                                Maximize:
                                <input type="text" value={this.state.objective}
                                       onChange={(event) => this.handleObjectiveChange(event.target.value)}/>
                            </label>
                        </div>
                        <div>
                            <label>
                                Subject To:
                                <input type="button" value="Add" onClick={() => this.handleClick()}/>
                            </label>
                        </div>

                        {constraintsHTML}
                    </div>

                    <Wallet address={this.state.address} bounty={this.state.bounty}
                            onAddressChange={this.handleAddressChange.bind(this)}
                            onBountyChange={this.handleBountyChange.bind(this)}/>

                    <div>
                        <label>Time:</label>
                        <input type="time" value={this.state.time} min="00:00"
                               onChange={(event) => this.handleTimeChange(event.target.value)}/>
                    </div>

                    <div>
                        <input type="submit" value="Submit"/>
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

export default ProblemFactory;