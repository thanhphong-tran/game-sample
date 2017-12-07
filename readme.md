# User (admin)
 - username: String
 - password: String
 - fullname: String
 - admin: Bool
 - location: String
 - meta:
   - age: Number
   - website: String
 - status: Number
 - created_at: Number
 - updated_at: Number
 - authorization: String

# App
 - name: String
 - desc: String
 - icons: String
 - platform: String
 - storeurl: String
 - bundle_id: String
 - categories: String
 - is_instore: Number
 - created_at: Number
 - updated_at: Number

# Player
 - username: String
 - password: String
 - created_at: Number
 - updated_at: Number

# Campaign
 - name: String
 - desc: String
 - created_at: Number
 - updated_at: Number

# Tracking
 - app_id: ObjectId
 - app_key: String
 - user_id: String
 - event_type: Int
 - data: Json
 - created_at: Int
 - updated_at: int
 - is_deleted: Int

# Event Types
 - 0: Install
 - 1: Open
 - 2: Login
 - 3: Register
 - 4: Create Character
 - 5: Payment
