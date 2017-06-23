package user

import (
	"github.com/pritunl/pritunl-zero/database"
	"gopkg.in/mgo.v2/bson"
)

func Get(db *database.Database, userId bson.ObjectId) (
	usr *User, err error) {

	coll := db.Users()
	usr = &User{}

	err = coll.FindOneId(userId, usr)
	if err != nil {
		return
	}

	return
}

func HasSuper(db *database.Database) (exists bool, err error) {
	coll := db.Users()

	count, err := coll.Find(bson.M{
		"administrator": "super",
	}).Count()
	if err != nil {
		err = database.ParseError(err)
		return
	}

	if count > 0 {
		exists = true
	}

	return
}