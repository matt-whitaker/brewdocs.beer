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
        display: 'inline-block',
        float: 'left'
    }
});

const placeholderPicture = 'http://placekitten.com/220/300';

class Home extends React.Component {
    constructor (...args) {
        super(...args);
        this.state = {fields: {}}
    }
    render () {
        const {recipe, classes} = this.props;

        return (
            <Grid container spacing={16} component="form" noValidate autoComplete="off">
                <Grid item xs={8}>
                    <TextField
                        id="name"
                        label="Name"
                        className={classes.textField}
                        value={this.state.fields.name}
                        onChange={this.handleInput('name')}
                        margin="normal"/>
                    <img src={this.state.fields.picture || placeholderPicture} className={classes.recipeImage}/>
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