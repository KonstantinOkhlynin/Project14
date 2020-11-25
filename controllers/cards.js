const Card = require('../models/card');
const NotForbiddenError = require('../errors/NotForbiddenError');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.id).orFail(new Error('NotValidId'))
    .then((data) => {
      if (data.owner.toString() !== req.user._id) {
        throw new NotForbiddenError('Нельзя удалить чужую карточку');
      }
      return res.status(200).send(data);
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        return next(new NotFoundError(`Карточка с id ${req.params.id} не найдена`));
      } if (err.name === 'CastError') {
        return next(new BadRequestError(`Ошибка валидации id карточки ${req.params.id}`));
      }
      return next(err);
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link, owner } = req.body;
  Card.create({ name, link, owner }).orFail(new Error('NotValidData'))
    .then((user) => res.status(200).send({ user }))
    .catch((err) => {
      if (err.message === 'NotValidData') {
        return next(new NotFoundError('Проверьте правильность данных'));
      }
      return next(new BadRequestError(`Ошибка,карточка не была создана ${err.message}`));
    });
};
