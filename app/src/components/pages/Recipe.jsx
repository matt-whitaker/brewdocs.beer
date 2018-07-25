import React from 'react';
import deepEqual from 'deep-equal';
import {clone} from 'ramda';
import {withRouter} from 'react-router';
import {withStyles} from '@material-ui/core/styles';
import {Grid, TextField, Hidden} from '@material-ui/core';

const styles = (theme) => ({
    textField: {
        margin: theme.spacing.unit
    },
    recipeImage: {
        display: 'inline-block',
        float: 'left'
    },
    recipeDetails: {
        display: 'flex'
    }
});

const placeholderPicture = 'http://placekitten.com/220/300';

class Home extends React.Component {
    constructor (...args) {
        super(...args);
        this.state = {fields: {}}
    }
    componentWillMount () {
        const currentProps = this.props;

        if (currentProps.recipe) {
            this.setState({fields: clone(currentProps.recipe)});
        }
    }
    componentWillReceiveProps (newProps) {
        const oldProps = this.props;

        if (!deepEqual(oldProps.recipe, newProps.recipe)) {
            this.setState({fields: clone(newProps.recipe)});
        }
    }
    render () {
        const {recipe, classes} = this.props;

        return (
            <Grid container spacing={16} component="form" noValidate autoComplete="off">
                <Grid item xs={8} className={classes.recipeDetails}>
                    <Hidden smDown="hide">
                        <img src={this.state.fields.picture || placeholderPicture}
                             className={classes.recipeImage}/>
                    </Hidden>
                    <div>
                        <TextField
                            id="name"
                            label="Name"
                            className={classes.textField}
                            value={this.state.fields.name}
                            onChange={this.handleInput('name')}
                            margin="normal"/>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    Note Bar
                </Grid>
            </Grid>
        );
    }
    handleInput (field) {
        return (event) => {
            this.setState({
                fields: {
                    ...this.state.fields,
                    [field]: event.target.value
                }
            });
        };
    };
}

export default withRouter(withStyles(styles)(Home));