# API documentation

## Public routes

### POST Register

```
/api/v1/welcome

response 'welcome to LearnlyApp assessment'
```

### POST Register

```
/api/v1/auth/register

{
    "firstname": "user-1",
    "lastname": "lastname-1",
    "email": "user-1@email.com",
    "password": "password"
}
```

### POST LOGIN as a patient

```
/api/v1/authentication/login/patient

{
    "email": "user@email.com",
    "password": "password"
}
```

### POST LOGIN as a staff

```
/api/v1/authentication/login/staff

{
    "email": "user@email.com",
    "password": "password"
}
```

## Private routes

### PATCH Update a firstname & lastname

```
/api/v1/authentication/login/patient

{
    "firstname": "new firstname",
    "lastname": "new lastname",
    "email": "user@email.com"
}
```

## POST Update user to a role of DOCTOR (need a role of DOCTOR to access route)

```
/api/v1/profile/staff

{
    "email": "user",
    "role": "DOCTOR"
}
```

## GET All types of test

```
/api/v1/test-types

[
    {
        "types": "blood work"
    },
    {
        "types": "IV drip"
    },
]
```


## POST Create a reservation

```
/api/v1/reservation

{
    "staff_id": "uuid",
    "name": "user",
    "email": "user@email.com",
    "test_types": ["blood work", "IV drip"],
    "time": 780009511
}
```