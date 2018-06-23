import React from 'react';
import {withRouter} from 'react-router';
import {withStyles} from '@material-ui/core/styles';
import {Grid, TextField} from '@material-ui/core';

const styles = (theme) => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    },
    recipeImage: {
        display: 'inline-block'
    }
});

class Home extends React.Component {
    constructor (...args) {
        super(...args);
        this.state = {fields: {}}
    }
    render () {
        const {recipe, classes} = this.props;

        return (
            <Grid container spacing={12} component="form" noValidate autoComplete="off">
                <Grid item xs={8}>
                    <TextField
                        id="name"
                        label="Name"
                        className={classes.textField}
                        value={this.state.fields.name}
                        onChange={this.handleInput('name')}
                        margin="normal"/>
                </Grid>
                <Grid item xs={4}>
                    <img src="http://placekitten.com/200/300" classes={classes.recipeImage}/>
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