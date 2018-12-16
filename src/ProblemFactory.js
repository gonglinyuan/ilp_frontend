import React from 'react';

function Constraint(props) {
    return (
        <tr>
            <td>
                <input className="Constraint" type="text" value={props.value} onChange={props.onChange}/>
            </td>
        </tr>
    );
}

class ProblemFactory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            objective: '',
            constraints: []
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

    handleSubmit(event) {
        console.log(this.state);
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
                    <table>
                        <tbody>
                        <tr>
                            <td>
                                <label>
                                    Maximize:
                                    <input type="text" value={this.state.objective}
                                           onChange={(event) => this.handleObjectiveChange(event.target.value)}/>
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>
                                    Subject To:
                                    <input type="button" value="Add" onClick={() => this.handleClick()}/>
                                </label>
                            </td>
                        </tr>

                        {constraintsHTML}

                        <tr>
                            <td>
                                <input type="submit" value="Submit" />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        );
    }
}

export default ProblemFactory;