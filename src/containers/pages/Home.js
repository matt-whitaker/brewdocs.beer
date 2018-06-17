import {connect} from 'react-redux';
import Home from '../../components/pages/Home';

import * as recipeActions from '../../dux/recipes';

const mapStateToProps = ({recipes}) => ({recipes});

const actions = {...recipeActions};

export default connect(mapStateToProps, actions)(Home);