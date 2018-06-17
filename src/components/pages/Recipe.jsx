import React from 'react';
import {withRouter} from 'react-router';
import {withStyles} from '@material-ui/core/styles';
import styles from '../../jss/styles';

class Home extends React.Component {
    render () {
        const {recipe, classes} = this.props;

        if (!recipe) return 'Loading...';

        return (
            <div>
                <Typography gutterBottom variant="headline" component="h2">
                    {recipe.name}
                </Typography>
            </div>
        );
    }
}

export default withRouter(withStyles(styles)(Home));